import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
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

  const supabase = await createSupabaseServerComponentClient();

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

  if (!appointmentId) {
    console.error("No appointment_id in payment intent metadata");
    return;
  }

  // Update payment record
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("*")
    .eq("stripe_payment_id", paymentIntent.id)
    .single();

  if (existingPayment) {
    await supabase
      .from("payments")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingPayment.id);
  } else {
    // Get appointment details
    const { data: appointment } = await supabase
      .from("appointments")
      .select("senior_id, specialist_id")
      .eq("id", appointmentId)
      .single();

    if (appointment) {
      await supabase.from("payments").insert({
        appointment_id: appointmentId,
        senior_id: appointment.senior_id,
        specialist_id: appointment.specialist_id,
        amount: paymentIntent.amount / 100,
        currency: "USD",
        status: "completed",
        payment_method: "card",
        stripe_payment_id: paymentIntent.id,
        stripe_customer_id: paymentIntent.customer as string,
      });
    }
  }

  // Update appointment status if needed
  await supabase
    .from("appointments")
    .update({ status: "confirmed" })
    .eq("id", appointmentId)
    .eq("status", "pending");
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

