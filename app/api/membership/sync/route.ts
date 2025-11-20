import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { stripe } from "@/lib/stripe/client";
import { logMembershipCreated } from "@/lib/utils/activityLogger";
import Stripe from "stripe";

/**
 * Manually sync membership from Stripe subscription
 * Used as fallback if webhook hasn't processed
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerComponentClient();

    // Use service role client to bypass RLS for membership operations
    let serviceRoleSupabase;
    try {
      const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/server");
      serviceRoleSupabase = createSupabaseServiceRoleClient();
      console.log("[Membership Sync] Using service role client");
    } catch (serviceRoleError) {
      console.warn("[Membership Sync] Service role not available, using regular client");
      serviceRoleSupabase = supabase;
    }

    // Retrieve subscription from Stripe first to determine status
    const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    console.log("[Membership Sync] Subscription status:", subscription.status);
    console.log("[Membership Sync] Subscription metadata:", subscription.metadata);
    
    // Allow sync if subscription is active, trialing, or incomplete (payment just completed)
    // Also allow "past_due" in case payment is processing
    const validStatuses = ["active", "trialing", "incomplete", "past_due"];
    if (!validStatuses.includes(subscription.status)) {
      console.error("[Membership Sync] Subscription is not in a valid state:", subscription.status);
      return NextResponse.json(
        { error: `Subscription is not ready (status: ${subscription.status}). Please wait for payment to complete.` },
        { status: 400 }
      );
    }
    
    // Determine membership status based on subscription and payment status
    let membershipStatus: "active" | "pending" = "active";
    
    // If subscription is incomplete, check if payment has been confirmed
    if (subscription.status === "incomplete") {
      try {
        // Get the latest invoice to check payment status
        const latestInvoiceId = typeof subscription.latest_invoice === "string" 
          ? subscription.latest_invoice 
          : subscription.latest_invoice?.id;
        
        if (latestInvoiceId) {
          const invoice = await stripe.invoices.retrieve(latestInvoiceId, {
            expand: ["payment_intent"],
          });
          
          // If invoice is paid, membership should be active
          if (invoice.status === "paid") {
            console.log("[Membership Sync] Invoice is paid, setting membership to active");
            membershipStatus = "active";
          } else {
            // Access payment_intent with type assertion since it's expanded
            const paymentIntentData = (invoice as any).payment_intent;
            if (paymentIntentData) {
              // Check payment intent status
              let paymentIntent: Stripe.PaymentIntent;
              if (typeof paymentIntentData === "string") {
                paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentData);
              } else {
                paymentIntent = paymentIntentData;
              }
            
              if (paymentIntent.status === "succeeded") {
                console.log("[Membership Sync] Payment intent succeeded, setting membership to active");
                membershipStatus = "active";
              } else {
                console.log("[Membership Sync] Payment intent status:", paymentIntent.status);
                // If payment is processing, still set to active (webhook will confirm)
                membershipStatus = "active";
              }
            } else {
              console.log("[Membership Sync] Invoice not paid yet, status:", invoice.status);
              // Payment might still be processing, but set to active anyway
              // The webhook will update if needed
              membershipStatus = "active";
            }
          }
        } else {
          // No invoice yet, but payment was confirmed, so set to active
          membershipStatus = "active";
        }
      } catch (invoiceError) {
        console.warn("[Membership Sync] Could not check invoice status:", invoiceError);
        // If we can't check, assume active since payment was confirmed
        membershipStatus = "active";
      }
    } else if (subscription.status === "active" || subscription.status === "trialing") {
      membershipStatus = "active";
    }
    
    console.log("[Membership Sync] Setting membership status to:", membershipStatus);

    const userId = subscription.metadata?.user_id;
    const membershipPlanId = subscription.metadata?.membership_plan_id;

    console.log("[Membership Sync] User ID from metadata:", userId, "Expected:", user.id);
    console.log("[Membership Sync] Membership Plan ID from metadata:", membershipPlanId);

    if (!userId || !membershipPlanId) {
      console.error("[Membership Sync] Missing metadata in subscription:", {
        hasUserId: !!userId,
        hasMembershipPlanId: !!membershipPlanId,
        metadata: subscription.metadata
      });
      return NextResponse.json(
        { error: "Subscription metadata is missing. Please contact support." },
        { status: 400 }
      );
    }

    if (userId !== user.id) {
      console.error("[Membership Sync] User ID mismatch:", {
        metadataUserId: userId,
        currentUserId: user.id
      });
      return NextResponse.json(
        { error: "Subscription does not belong to current user" },
        { status: 403 }
      );
    }

    // Check if membership already exists
    const { data: existingMembership } = await serviceRoleSupabase
      .from("user_memberships")
      .select("*")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMembership) {
      // If membership exists but is pending, update it to active if payment is confirmed
      if (existingMembership.status === "pending" && membershipStatus === "active") {
        console.log("[Membership Sync] Updating existing pending membership to active");
        const { data: updatedMembership, error: updateError } = await serviceRoleSupabase
          .from("user_memberships")
          .update({
            status: "active",
            next_billing_date: (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000).toISOString().split("T")[0]
              : existingMembership.next_billing_date,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMembership.id)
          .select()
          .single();
        
        if (updateError) {
          console.error("[Membership Sync] Error updating membership status:", updateError);
        } else {
          // Update senior profile if needed
          await serviceRoleSupabase
            .from("senior_profiles")
            .update({ membership_id: existingMembership.id })
            .eq("user_id", user.id);
          
          return NextResponse.json({
            success: true,
            membershipId: existingMembership.id,
            message: "Membership updated to active",
          });
        }
      }
      
      // If already active, just return success
      if (existingMembership.status === "active") {
        return NextResponse.json({
          success: true,
          membershipId: existingMembership.id,
          message: "Membership already exists and is active",
        });
      }
      
      // If status is something else, update it
      if (existingMembership.status !== membershipStatus) {
        await serviceRoleSupabase
          .from("user_memberships")
          .update({
            status: membershipStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMembership.id);
      }
      
      return NextResponse.json({
        success: true,
        membershipId: existingMembership.id,
        message: "Membership already exists",
      });
    }

    // Create membership manually
    const { data: newMembership, error: createError } = await serviceRoleSupabase
      .from("user_memberships")
      .insert({
        user_id: userId,
        membership_plan_id: membershipPlanId,
        status: membershipStatus, // Use the determined status
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
      console.error("[Membership Sync] Error creating membership:", createError);
      console.error("[Membership Sync] Error details:", JSON.stringify(createError, null, 2));
      return NextResponse.json(
        { 
          error: "Failed to create membership",
          details: process.env.NODE_ENV === "development" ? createError.message : undefined
        },
        { status: 500 }
      );
    }

    if (newMembership) {
      // Update senior profile with membership_id using service role client
      const { error: profileUpdateError } = await serviceRoleSupabase
        .from("senior_profiles")
        .update({ membership_id: newMembership.id })
        .eq("user_id", userId);
      
      if (profileUpdateError) {
        console.error("[Membership Sync] Error updating senior profile:", profileUpdateError);
        // Don't fail - membership is created, profile update can be retried
      }

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

      return NextResponse.json({
        success: true,
        membershipId: newMembership.id,
        message: "Membership created successfully",
      });
    }

    return NextResponse.json(
      { error: "Failed to create membership" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error syncing membership:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

