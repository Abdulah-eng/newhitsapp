import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { stripe } from "@/lib/stripe/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await params;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerComponentClient();

    // Fetch appointment to verify ownership
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id, senior_id, specialist_id, status")
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (appointment.senior_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check for existing payment
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("appointment_id", appointmentId)
      .eq("status", "completed")
      .maybeSingle();

    if (existingPayment) {
      return NextResponse.json({
        success: true,
        message: "Payment already exists",
        payment: existingPayment,
      });
    }

    // Helper function to create payment record
    async function createPaymentRecord(
      paymentIntent: any,
      appointment: any,
      supabase: any
    ) {
      // Use service role client to bypass RLS for payment insertion
      let serviceRoleSupabase;
      try {
        serviceRoleSupabase = createSupabaseServiceRoleClient();
      } catch (serviceRoleError) {
        console.warn("[Sync Payment] Service role key not set, using regular client. RLS policy must allow inserts.");
        serviceRoleSupabase = supabase;
      }

      // Create payment record
      const { data: newPayment, error: insertError } = await serviceRoleSupabase
        .from("payments")
        .insert({
          appointment_id: appointmentId,
          senior_id: appointment.senior_id,
          specialist_id: appointment.specialist_id,
          amount: paymentIntent.amount / 100,
          currency: "USD",
          status: "completed",
          payment_method: "card",
          stripe_payment_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer as string,
        })
        .select()
        .single();

      if (insertError) {
        console.error("[Sync Payment] Error inserting payment:", insertError);
        return NextResponse.json(
          { error: "Failed to create payment record", details: insertError },
          { status: 500 }
        );
      }

      // Update appointment status if needed (use service role for this too)
      if (appointment.status === "pending") {
        await serviceRoleSupabase
          .from("appointments")
          .update({ status: "confirmed" })
          .eq("id", appointmentId)
          .eq("status", "pending");
      }

      return NextResponse.json({
        success: true,
        message: "Payment synced successfully",
        payment: newPayment,
      });
    }

    // Try to find payment intent from Stripe
    // Search more broadly - check all recent payment intents with appointment_id metadata
    try {
      // First, try to get payment intent ID from request body if provided
      const body = await request.json().catch(() => ({}));
      const paymentIntentId = body.paymentIntentId;

      if (paymentIntentId) {
        // Direct lookup by payment intent ID
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          
          if (
            paymentIntent.metadata.appointment_id === appointmentId &&
            paymentIntent.status === "succeeded"
          ) {
            console.log(
              `[Sync Payment] Found payment intent by ID: ${paymentIntent.id}`
            );
            return await createPaymentRecord(paymentIntent, appointment, supabase);
          }
        } catch (err) {
          console.log(`[Sync Payment] Payment intent ${paymentIntentId} not found or invalid`);
        }
      }

      // Search by customer if available
      const { data: userData } = await supabase
        .from("users")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

      if (userData?.stripe_customer_id) {
        // List recent payment intents for this customer
        const paymentIntents = await stripe.paymentIntents.list({
          customer: userData.stripe_customer_id,
          limit: 20, // Increased limit
        });

        // Find payment intent with matching appointment_id in metadata
        const matchingPaymentIntent = paymentIntents.data.find(
          (pi) =>
            pi.metadata.appointment_id === appointmentId &&
            pi.status === "succeeded"
        );

        if (matchingPaymentIntent) {
          console.log(
            `[Sync Payment] Found matching payment intent by customer: ${matchingPaymentIntent.id}`
          );
          return await createPaymentRecord(matchingPaymentIntent, appointment, supabase);
        }
      }

      // Last resort: search all recent payment intents (last 50)
      // This is less efficient but more reliable
      console.log(`[Sync Payment] Searching all recent payment intents...`);
      const allPaymentIntents = await stripe.paymentIntents.list({
        limit: 50,
      });

      const matchingPaymentIntent = allPaymentIntents.data.find(
        (pi) =>
          pi.metadata.appointment_id === appointmentId &&
          pi.status === "succeeded"
      );

      if (matchingPaymentIntent) {
        console.log(
          `[Sync Payment] Found matching payment intent in recent list: ${matchingPaymentIntent.id}`
        );
        return await createPaymentRecord(matchingPaymentIntent, appointment, supabase);
      }
    } catch (stripeError: any) {
      console.error("[Sync Payment] Stripe error:", stripeError);
    }

    return NextResponse.json({
      success: false,
      message: "No payment found in Stripe",
    });
  } catch (error: any) {
    console.error("Error syncing payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

