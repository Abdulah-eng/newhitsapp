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

    // Fetch appointment to verify ownership and get payout calculation data
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id, senior_id, specialist_id, status, duration_minutes, base_price, travel_fee, travel_distance_miles")
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

      // Calculate payout structure
      const hoursWorked = (appointment.duration_minutes || 60) / 60;
      const techPay = hoursWorked * 30.0; // $30 per hour
      
      const travelMiles = appointment.travel_distance_miles || 0;
      const includedMiles = 20;
      const mileagePay = travelMiles > includedMiles 
        ? (travelMiles - includedMiles) * 0.60 // $0.60 per mile after 20 miles
        : 0;

      // Get tax amount from payment intent metadata
      const taxAmount = paymentIntent.metadata.tax_amount 
        ? parseFloat(paymentIntent.metadata.tax_amount) / 100 
        : 0;

      // Get base amount and travel fee from metadata or appointment
      const baseServiceAmount = paymentIntent.metadata.base_amount 
        ? parseFloat(paymentIntent.metadata.base_amount) / 100 
        : appointment.base_price || 0;
      
      const travelFeeAmount = paymentIntent.metadata.travel_fee 
        ? parseFloat(paymentIntent.metadata.travel_fee) / 100 
        : appointment.travel_fee || 0;

      // Calculate company revenue
      const totalAmount = paymentIntent.amount / 100;
      const companyRevenue = totalAmount - techPay - mileagePay - taxAmount;

      // Create payment record with payout calculations
      const { data: newPayment, error: insertError } = await serviceRoleSupabase
        .from("payments")
        .insert({
          appointment_id: appointmentId,
          senior_id: appointment.senior_id,
          specialist_id: appointment.specialist_id,
          amount: totalAmount,
          currency: "USD",
          status: "completed",
          payment_method: "card",
          stripe_payment_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer as string,
          // Payout structure fields
          hours_worked: hoursWorked,
          mileage: travelMiles,
          tech_pay: techPay,
          mileage_pay: mileagePay,
          company_revenue: companyRevenue,
          tax_amount: taxAmount,
          base_service_amount: baseServiceAmount,
          travel_fee_amount: travelFeeAmount,
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

