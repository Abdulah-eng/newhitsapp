import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent, getOrCreateCustomer } from "@/lib/stripe/client";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId, amount } = body;

    if (!appointmentId || !amount) {
      return NextResponse.json(
        { error: "Appointment ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify appointment belongs to user
    const supabase = await createSupabaseServerComponentClient();
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("*, senior:senior_id(email, full_name)")
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.senior_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(
      user.email || appointment.senior.email,
      user.full_name || appointment.senior.full_name,
      user.id
    );

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      amount,
      appointmentId,
      customer.id
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

