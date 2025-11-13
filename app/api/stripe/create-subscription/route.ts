import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";

/**
 * Create a Stripe subscription for a membership plan
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Create Subscription] Starting subscription creation...");
    
    const user = await getCurrentUser();
    if (!user) {
      console.error("[Create Subscription] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Create Subscription] User:", user.id, user.email);

    const body = await request.json();
    const { membershipPlanId } = body;

    if (!membershipPlanId) {
      console.error("[Create Subscription] Missing membershipPlanId");
      return NextResponse.json(
        { error: "Membership plan ID is required" },
        { status: 400 }
      );
    }

    console.log("[Create Subscription] Membership Plan ID:", membershipPlanId);

    const supabase = await createSupabaseServerComponentClient();

    // Fetch membership plan details
    const { data: plan, error: planError } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("id", membershipPlanId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      console.error("[Create Subscription] Plan error:", planError);
      return NextResponse.json(
        { error: "Membership plan not found" },
        { status: 404 }
      );
    }

    console.log("[Create Subscription] Plan found:", plan.name, plan.plan_type, plan.monthly_price);

    // Check if user already has an active membership
    const { data: existingMembership } = await supabase
      .from("user_memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json(
        { error: "You already have an active membership. Please cancel it first." },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const { data: customerData } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = customerData?.stripe_customer_id;

    if (!customerId) {
      console.log("[Create Subscription] Creating new Stripe customer...");
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.full_name || undefined,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;
      console.log("[Create Subscription] Stripe customer created:", customerId);

      // Store customer ID in database
      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      
      if (updateError) {
        console.error("[Create Subscription] Error updating customer ID:", updateError);
      }
    } else {
      console.log("[Create Subscription] Using existing Stripe customer:", customerId);
    }

    // Create Stripe price for the membership plan
    // Check if price already exists
    console.log("[Create Subscription] Checking for existing price...");
    const prices = await stripe.prices.list({
      lookup_keys: [`membership_${plan.plan_type}`],
      active: true,
    });

    let priceId: string;
    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
      console.log("[Create Subscription] Using existing price:", priceId);
    } else {
      console.log("[Create Subscription] Creating new price...");
      // Create new price
      const price = await stripe.prices.create({
        unit_amount: Math.round(plan.monthly_price * 100), // Convert to cents
        currency: "usd",
        recurring: {
          interval: "month",
        },
        product_data: {
          name: plan.name,
        },
        lookup_key: `membership_${plan.plan_type}`,
        metadata: {
          membership_plan_id: membershipPlanId,
          description: plan.description || "",
        },
      });
      priceId = price.id;
      console.log("[Create Subscription] New price created:", priceId);
    }

    // Create subscription
    console.log("[Create Subscription] Creating Stripe subscription...");
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        user_id: user.id,
        membership_plan_id: membershipPlanId,
      },
    });

    console.log("[Create Subscription] Subscription created:", subscription.id, "Status:", subscription.status);

    // Get client secret from invoice payment intent
    const invoice = subscription.latest_invoice as any;
    console.log("[Create Subscription] Invoice:", invoice?.id, "Type:", typeof invoice);
    
    const paymentIntent = invoice?.payment_intent;
    console.log("[Create Subscription] Payment Intent:", paymentIntent?.id, "Client Secret:", paymentIntent?.client_secret ? "Present" : "Missing");

    if (!paymentIntent || !paymentIntent.client_secret) {
      console.error("[Create Subscription] No payment intent or client secret returned from Stripe");
      console.error("[Create Subscription] Invoice data:", JSON.stringify(invoice, null, 2));
      console.error("[Create Subscription] Subscription data:", JSON.stringify(subscription, null, 2));
      return NextResponse.json(
        { error: "Failed to initialize payment. Please try again." },
        { status: 500 }
      );
    }

    console.log("[Create Subscription] Success! Returning subscription and client secret");
    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      status: subscription.status,
    });
  } catch (error: any) {
    console.error("[Create Subscription] Error creating subscription:", error);
    console.error("[Create Subscription] Error stack:", error.stack);
    console.error("[Create Subscription] Error type:", error.type);
    console.error("[Create Subscription] Error code:", error.code);
    console.error("[Create Subscription] Error message:", error.message);
    
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? {
          type: error.type,
          code: error.code,
          stack: error.stack,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

