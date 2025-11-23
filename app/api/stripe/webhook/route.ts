import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createSupabaseServerComponentClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { logPaymentCompleted, logAppointmentStatusChange, logMembershipCreated, logMembershipCancelled, logMembershipReinstated } from "@/lib/utils/activityLogger";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Use service role client for webhook operations to bypass RLS
  let supabase;
  try {
    supabase = createSupabaseServiceRoleClient();
  } catch (serviceRoleError) {
    console.warn("[Webhook] Service role key not set, using regular client. RLS policy must allow operations.");
    supabase = await createSupabaseServerComponentClient();
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent, supabase);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment, supabase);
      break;

    case "charge.refunded":
      const refund = event.data.object as Stripe.Charge;
      await handleRefund(refund, supabase);
      break;

    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription, supabase);
      break;
    
    // Note: customer.subscription.created is handled by invoice.payment_succeeded
    // to ensure payment is completed before activating membership

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(deletedSubscription, supabase);
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceSubscription = (invoice as any).subscription;
      if (invoiceSubscription) {
        await handleSubscriptionPaymentSucceeded(invoice, supabase);
      }
      break;

    case "invoice.payment_failed":
      const failedInvoice = event.data.object as Stripe.Invoice;
      const failedInvoiceSubscription = (failedInvoice as any).subscription;
      if (failedInvoiceSubscription) {
        await handleSubscriptionPaymentFailed(failedInvoice, supabase);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  const appointmentId = paymentIntent.metadata.appointment_id;
  const subscriptionId = paymentIntent.metadata.subscription_id;
  const userId = paymentIntent.metadata.user_id;
  const membershipPlanId = paymentIntent.metadata.membership_plan_id;

  console.log(`[Webhook] Payment Intent ${paymentIntent.id} succeeded.`);
  console.log(`[Webhook] Metadata:`, paymentIntent.metadata);

  // Handle subscription payment (membership)
  if (subscriptionId && userId && membershipPlanId) {
    console.log(`[Webhook] Processing subscription payment for subscription ${subscriptionId}`);
    
    // Retrieve subscription to verify status
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (subscription.status === "active" || subscription.status === "trialing") {
        // Check if membership already exists
        const { data: existingMembership } = await supabase
          .from("user_memberships")
          .select("*")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (existingMembership) {
          // Update existing membership
          await supabase
            .from("user_memberships")
            .update({
              status: "active",
              next_billing_date: (subscription as any).current_period_end
                ? new Date((subscription as any).current_period_end * 1000).toISOString().split("T")[0]
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingMembership.id);
          
          console.log(`[Webhook] Updated existing membership ${existingMembership.id}`);
        } else {
          // Create new membership
          const { data: newMembership, error: createError } = await supabase
            .from("user_memberships")
            .insert({
              user_id: userId,
              membership_plan_id: membershipPlanId,
              status: "active",
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer?.id || "",
              next_billing_date: (subscription as any).current_period_end
                ? new Date((subscription as any).current_period_end * 1000).toISOString().split("T")[0]
                : null,
              started_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            console.error("[Webhook] Error creating membership:", createError);
            return;
          }

          if (newMembership) {
            // Update senior profile with membership_id
            await supabase
              .from("senior_profiles")
              .update({ membership_id: newMembership.id })
              .eq("user_id", userId);

            // Log membership creation
            const { data: plan } = await supabase
              .from("membership_plans")
              .select("name, plan_type, monthly_price")
              .eq("id", membershipPlanId)
              .single();

            if (plan) {
              await logMembershipCreated(
                newMembership.id,
                userId,
                plan.plan_type,
                plan.monthly_price
              );
            }

            console.log(`[Webhook] Created new membership ${newMembership.id} for user ${userId}`);
          }
        }
      }
    } catch (subscriptionError: any) {
      console.error("[Webhook] Error processing subscription payment:", subscriptionError);
    }
    
    // Return early - don't process as appointment payment
    return;
  }

  // Handle appointment payment (existing logic)
  if (!appointmentId) {
    console.error("[Webhook] No appointment_id or subscription_id in payment intent metadata. Metadata:", paymentIntent.metadata);
    return;
  }

  // Get appointment details first
  const { data: appointment } = await supabase
    .from("appointments")
    .select("senior_id, specialist_id")
    .eq("id", appointmentId)
    .single();

  if (!appointment) {
    console.error("Appointment not found for payment intent:", appointmentId);
    return;
  }

  // Check for existing payment by stripe_payment_id first
  const { data: existingPaymentByStripeId } = await supabase
    .from("payments")
    .select("*")
    .eq("stripe_payment_id", paymentIntent.id)
    .maybeSingle();

  if (existingPaymentByStripeId) {
    // Update existing payment record
    console.log(`[Webhook] Updating existing payment ${existingPaymentByStripeId.id} to completed`);
    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingPaymentByStripeId.id)
      .select()
      .single();

    if (updateError) {
      console.error("[Webhook] Error updating payment:", updateError);
    } else {
      console.log(`[Webhook] Successfully updated payment ${updatedPayment?.id} to completed status`);
    }
  } else {
    // Check if there's an existing payment for this appointment that needs to be updated
    const { data: existingPaymentByAppointment } = await supabase
      .from("payments")
      .select("*")
      .eq("appointment_id", appointmentId)
      .eq("status", "pending")
      .maybeSingle();

    if (existingPaymentByAppointment) {
      // Update existing payment record with Stripe payment ID
      console.log(`[Webhook] Updating payment ${existingPaymentByAppointment.id} for appointment ${appointmentId} to completed`);
      const { data: updatedPayment, error: updateError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          stripe_payment_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer as string,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPaymentByAppointment.id)
        .select()
        .single();

      if (updateError) {
        console.error("[Webhook] Error updating payment:", updateError);
      } else {
        console.log(`[Webhook] Successfully updated payment ${updatedPayment?.id} to completed status`);
      }
    } else {
      // Create new payment record
      const paymentData = {
        appointment_id: appointmentId,
        senior_id: appointment.senior_id,
        specialist_id: appointment.specialist_id,
        amount: paymentIntent.amount / 100,
        currency: "USD",
        status: "completed",
        payment_method: "card",
        stripe_payment_id: paymentIntent.id,
        stripe_customer_id: paymentIntent.customer as string,
      };

      console.log(`[Webhook] Creating new payment record for appointment ${appointmentId}:`, paymentData);

      const { data: newPayment, error: insertError } = await supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single();

      if (insertError) {
        console.error("[Webhook] Error inserting payment:", insertError);
      } else {
        console.log(`[Webhook] Payment record created successfully: ${newPayment?.id}`);
      }
    }
  }

  // Update appointment status if needed
  // Note: Appointments can be "pending" or "confirmed" when payment is made
  // If "pending", update to "confirmed". If already "confirmed", leave as is.
  const { data: appointmentForStatus } = await supabase
    .from("appointments")
    .select("senior_id, status")
    .eq("id", appointmentId)
    .single();

  if (appointmentForStatus) {
    if (appointmentForStatus.status === "pending") {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "confirmed" })
        .eq("id", appointmentId)
        .eq("status", "pending");

      if (updateError) {
        console.error("Error updating appointment status:", updateError);
      } else {
        // Log appointment status change
        if (appointmentForStatus.senior_id) {
          await logAppointmentStatusChange(
            appointmentId,
            appointmentForStatus.senior_id,
            "pending",
            "confirmed"
          );
        }
      }
    }
    // If appointment is already "confirmed", no need to update status
  }

  // Log payment completion
  if (appointmentForStatus?.senior_id) {
    await logPaymentCompleted(
      paymentIntent.id,
      appointmentForStatus.senior_id,
      appointmentId,
      paymentIntent.amount / 100
    );
  }
}

async function handlePaymentFailure(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  const appointmentId = paymentIntent.metadata.appointment_id;

  if (!appointmentId) return;

  await supabase
    .from("payments")
    .update({
      status: "failed",
      failure_reason: paymentIntent.last_payment_error?.message || "Payment failed",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_payment_id", paymentIntent.id);
}

async function handleRefund(charge: Stripe.Charge, supabase: any) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) return;

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("stripe_payment_id", paymentIntentId)
    .single();

  if (payment) {
    const refundAmount = charge.amount_refunded / 100;

    await supabase
      .from("payments")
      .update({
        status: "refunded",
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);
  }
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const userId = subscription.metadata.user_id;
  const membershipPlanId = subscription.metadata.membership_plan_id;

  if (!userId || !membershipPlanId) {
    console.error("Missing user_id or membership_plan_id in subscription metadata");
    return;
  }

  // Find or create membership record
  const { data: existingMembership } = await supabase
    .from("user_memberships")
    .select("*")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const updates: Record<string, any> = {
    user_id: userId,
    membership_plan_id: membershipPlanId,
    status: subscription.status === "active" ? "active" : "cancelled",
    stripe_subscription_id: subscription.id,
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id || "",
    next_billing_date: (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000).toISOString().split("T")[0]
      : null,
    updated_at: new Date().toISOString(),
  };

  if (subscription.cancel_at_period_end) {
    updates.cancellation_requested_at = new Date().toISOString();
    updates.cancellation_effective_date = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString().split("T")[0]
      : updates.next_billing_date;
    updates.cancellation_reason =
      updates.cancellation_reason || "User requested cancellation";
  } else {
    updates.cancellation_requested_at = null;
    updates.cancellation_effective_date = null;
  }

  if (subscription.status === "active") {
    updates.cancelled_at = null;
    updates.cancellation_reason = null;
  }

  if (existingMembership) {
    const wasCancelled = existingMembership.status === "cancelled";

    if (subscription.status === "active" && wasCancelled) {
      updates.reactivated_at = new Date().toISOString();
      updates.reactivated_from_membership_id = existingMembership.id;
    } else if (subscription.status !== "active") {
      updates.reactivated_at = null;
    }

    await supabase.from("user_memberships").update(updates).eq("id", existingMembership.id);

    if (subscription.status === "active" && wasCancelled) {
      await supabase
        .from("senior_profiles")
        .update({ membership_id: existingMembership.id })
        .eq("user_id", userId);

      const { data: plan } = await supabase
        .from("membership_plans")
        .select("plan_type")
        .eq("id", membershipPlanId)
        .single();

      await logMembershipReinstated(existingMembership.id, userId, plan?.plan_type);
    }
  } else {
    const { data: newMembership } = await supabase
      .from("user_memberships")
      .insert({
        ...updates,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (newMembership && subscription.status === "active") {
      await supabase
        .from("senior_profiles")
        .update({ membership_id: newMembership.id })
        .eq("user_id", userId);

      const { data: plan } = await supabase
        .from("membership_plans")
        .select("name, plan_type, monthly_price")
        .eq("id", membershipPlanId)
        .single();

      if (plan) {
        await logMembershipCreated(newMembership.id, userId, plan.plan_type, plan.monthly_price);
      }
    }
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const { data: membership } = await supabase
    .from("user_memberships")
    .select("*")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (membership) {
    await supabase
      .from("user_memberships")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_effective_date: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        cancellation_reason: membership.cancellation_reason || "Subscription cancelled via Stripe",
        updated_at: new Date().toISOString(),
      })
      .eq("id", membership.id);

    // Remove membership_id from senior profile
    await supabase
      .from("senior_profiles")
      .update({ membership_id: null })
      .eq("user_id", membership.user_id);

    // Log membership cancellation
    await logMembershipCancelled(
      membership.id,
      membership.user_id,
      "Subscription cancelled via Stripe"
    );
  }
}

async function handleSubscriptionPaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const invoiceSubscription = (invoice as any).subscription;
  const subscriptionId = typeof invoiceSubscription === "string" 
    ? invoiceSubscription 
    : invoiceSubscription?.id;
  if (!subscriptionId) return;

  // Retrieve subscription to get metadata
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.user_id;
  const membershipPlanId = subscription.metadata.membership_plan_id;

  if (!userId || !membershipPlanId) {
    console.error("Missing user_id or membership_plan_id in subscription metadata");
    return;
  }

  // Check if membership already exists
  let { data: membership } = await supabase
    .from("user_memberships")
    .select("*")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (membership) {
    // Update existing membership
    await supabase
      .from("user_memberships")
      .update({
        next_billing_date: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString().split("T")[0]
          : null,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", membership.id);
  } else {
    // Create new membership (first payment succeeded)
    const { data: newMembership } = await supabase
      .from("user_memberships")
      .insert({
        user_id: userId,
        membership_plan_id: membershipPlanId,
        status: "active",
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: typeof subscription.customer === "string" 
          ? subscription.customer 
          : subscription.customer?.id || "",
        next_billing_date: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString().split("T")[0]
          : null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (newMembership) {
      // Update senior profile with membership_id
      await supabase
        .from("senior_profiles")
        .update({ membership_id: newMembership.id })
        .eq("user_id", userId);

      // Log membership creation
      const { data: plan } = await supabase
        .from("membership_plans")
        .select("name, plan_type, monthly_price")
        .eq("id", membershipPlanId)
        .single();

      if (plan) {
        await logMembershipCreated(
          newMembership.id,
          userId,
          plan.plan_type,
          plan.monthly_price
        );
      }
    }
  }
}

async function handleSubscriptionPaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const invoiceSubscription = (invoice as any).subscription;
  const subscriptionId = typeof invoiceSubscription === "string" 
    ? invoiceSubscription 
    : invoiceSubscription?.id;
  if (!subscriptionId) return;

  const { data: membership } = await supabase
    .from("user_memberships")
    .select("*")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (membership) {
    // Optionally update status or send notification
    console.log(`Subscription payment failed for membership ${membership.id}`);
    // You might want to set status to "pending" or send an email notification
  }
}

