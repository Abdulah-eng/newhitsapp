import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createSupabaseServerComponentClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";
import Stripe from "stripe";

/**
 * Create a Stripe subscription for a membership plan
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Create Subscription] Starting subscription creation...");
    
    // Check Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[Create Subscription] STRIPE_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Payment service not configured. Please contact support." },
        { status: 500 }
      );
    }
    
    const user = await getCurrentUser();
    if (!user) {
      console.error("[Create Subscription] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.email) {
      console.error("[Create Subscription] User email missing:", user.id);
      return NextResponse.json(
        { error: "User email is required. Please update your profile." },
        { status: 400 }
      );
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

    // Use service role client for all database operations to bypass RLS
    let supabase;
    let serviceRoleSupabase;
    try {
      serviceRoleSupabase = createSupabaseServiceRoleClient();
      supabase = serviceRoleSupabase; // Use service role for all queries
      console.log("[Create Subscription] Using service role client");
    } catch (serviceRoleError: any) {
      console.error("[Create Subscription] Service role key not configured!");
      console.error("[Create Subscription] Service role error:", serviceRoleError?.message || serviceRoleError);
      console.error("[Create Subscription] Falling back to regular client (may fail due to RLS)");
      supabase = await createSupabaseServerComponentClient();
      serviceRoleSupabase = supabase;
      
      // Warn that this might fail
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("[Create Subscription] WARNING: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables!");
        console.error("[Create Subscription] Database operations may fail due to Row Level Security policies.");
      }
    }

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
    // Ensure user exists in users table first (they should, but check)
    const { data: userData, error: userCheckError } = await serviceRoleSupabase
      .from("users")
      .select("id, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    
    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("[Create Subscription] Error checking user existence:", userCheckError);
      console.error("[Create Subscription] Error code:", userCheckError.code);
      console.error("[Create Subscription] Error message:", userCheckError.message);
      console.error("[Create Subscription] Error details:", JSON.stringify(userCheckError, null, 2));
      return NextResponse.json(
        { error: "Failed to retrieve user data. Please try again." },
        { status: 500 }
      );
    }
    
    // If user doesn't exist in users table, create a basic record
    let customerData: { id: string; stripe_customer_id: string | null } | null = null;
    
    if (!userData && userCheckError?.code === "PGRST116") {
      console.warn("[Create Subscription] User not found in users table, creating basic record:", user.id);
      const { data: newUserData, error: createUserError } = await serviceRoleSupabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.full_name || user.email?.split("@")[0] || "User",
          role: "senior", // Default to senior for membership subscriptions
        })
        .select("id, stripe_customer_id")
        .single();
      
      if (createUserError || !newUserData) {
        console.error("[Create Subscription] Failed to create user record:", createUserError);
        return NextResponse.json(
          { error: "Failed to initialize user profile. Please contact support." },
          { status: 500 }
        );
      }
      
      // Use the newly created user data
      customerData = { id: newUserData.id, stripe_customer_id: newUserData.stripe_customer_id };
    } else if (userData) {
      customerData = { id: userData.id, stripe_customer_id: userData.stripe_customer_id };
    } else {
      // This shouldn't happen, but handle it
      console.error("[Create Subscription] Unexpected state: no userData and no error");
      return NextResponse.json(
        { error: "Failed to retrieve user data. Please try again." },
        { status: 500 }
      );
    }

    let customerId = customerData.stripe_customer_id;

    if (!customerId) {
      console.log("[Create Subscription] Creating new Stripe customer...");
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || user.email?.split("@")[0] || "HITS User",
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;
      console.log("[Create Subscription] Stripe customer created:", customerId);

      // Store customer ID in database using service role client
      const { error: updateError } = await serviceRoleSupabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      
      if (updateError) {
        console.error("[Create Subscription] Error updating customer ID:", updateError);
        console.error("[Create Subscription] Update error details:", JSON.stringify(updateError, null, 2));
        // Don't fail the request if update fails - customer is created in Stripe
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

    // Create subscription - similar to appointment payment flow
    // For subscriptions, we need to handle the invoice payment intent
    console.log("[Create Subscription] Creating Stripe subscription...");
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { 
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        user_id: user.id,
        membership_plan_id: membershipPlanId,
      },
    });

    console.log("[Create Subscription] Subscription created:", subscription.id, "Status:", subscription.status);

    // Get invoice and payment intent - handle both string IDs and expanded objects
    let invoice: Stripe.Invoice | null = null;
    let clientSecret: string | null = null;
    
    // Get invoice (handle string ID or expanded object)
    if (typeof subscription.latest_invoice === "string") {
      console.log("[Create Subscription] Retrieving invoice with payment intent expansion...");
      invoice = await stripe.invoices.retrieve(subscription.latest_invoice, {
        expand: ["payment_intent"],
      });
    } else if (subscription.latest_invoice) {
      invoice = subscription.latest_invoice as Stripe.Invoice;
    }
    
    console.log("[Create Subscription] Invoice ID:", invoice?.id, "Status:", invoice?.status, "Amount Due:", invoice?.amount_due);
    
    // Get payment intent from invoice
    if (invoice) {
      const paymentIntentData = (invoice as any).payment_intent;
      if (paymentIntentData) {
        let paymentIntent: Stripe.PaymentIntent;
        
        if (typeof paymentIntentData === "string") {
          console.log("[Create Subscription] Retrieving payment intent...");
          paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentData);
        } else {
          paymentIntent = paymentIntentData as Stripe.PaymentIntent;
        }
        
        clientSecret = paymentIntent.client_secret;
        console.log("[Create Subscription] Payment Intent ID:", paymentIntent.id, "Client Secret:", clientSecret ? "Present" : "Missing");
      } else {
        console.log("[Create Subscription] Invoice has no payment_intent");
        
        // If invoice is draft, finalize it first
        if (invoice.status === "draft") {
          try {
            console.log("[Create Subscription] Finalizing draft invoice...");
            const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {
              expand: ["payment_intent"],
            });
            
            const finalizedPaymentIntentData = (finalizedInvoice as any).payment_intent;
            if (finalizedPaymentIntentData) {
              let paymentIntent: Stripe.PaymentIntent;
              if (typeof finalizedPaymentIntentData === "string") {
                paymentIntent = await stripe.paymentIntents.retrieve(finalizedPaymentIntentData);
              } else {
                paymentIntent = finalizedPaymentIntentData as Stripe.PaymentIntent;
              }
              clientSecret = paymentIntent.client_secret;
              console.log("[Create Subscription] Got client secret from finalized invoice");
            }
          } catch (finalizeError: any) {
            console.error("[Create Subscription] Error finalizing invoice:", finalizeError.message);
          }
        }
        
        // If still no payment intent and invoice is open, create one manually
        // This is similar to how appointments work - create PaymentIntent directly
        if (!clientSecret && invoice.status === "open" && invoice.amount_due) {
          try {
            console.log("[Create Subscription] Creating PaymentIntent for open invoice (similar to appointment flow)...");
            const paymentIntent = await stripe.paymentIntents.create({
              amount: invoice.amount_due,
              currency: invoice.currency || "usd",
              customer: customerId,
              metadata: {
                user_id: user.id,
                membership_plan_id: membershipPlanId,
                subscription_id: subscription.id,
                invoice_id: invoice.id,
                type: "subscription", // Mark as subscription payment
              },
              automatic_payment_methods: {
                enabled: true,
              },
            });
            
            clientSecret = paymentIntent.client_secret;
            console.log("[Create Subscription] Created PaymentIntent:", paymentIntent.id, "Client Secret:", clientSecret ? "Present" : "Missing");
            
            // Try to attach the payment intent to the invoice
            // Note: This might not always work, but we'll use the payment intent directly
            try {
              await stripe.invoices.update(invoice.id, {
                default_payment_method: undefined, // Will be set after payment confirmation
              });
            } catch (updateError) {
              console.warn("[Create Subscription] Could not update invoice with payment intent (this is okay)");
            }
          } catch (createError: any) {
            console.error("[Create Subscription] Error creating PaymentIntent:", createError.message);
          }
        }
      }
    }
    
    // Check for setup intent as fallback (for payment method collection)
    if (!clientSecret && subscription.pending_setup_intent) {
      console.log("[Create Subscription] No payment intent, checking for setup intent...");
      let setupIntentId: string;
      if (typeof subscription.pending_setup_intent === "string") {
        setupIntentId = subscription.pending_setup_intent;
      } else {
        setupIntentId = (subscription.pending_setup_intent as Stripe.SetupIntent).id;
      }
      
      const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      clientSecret = setupIntent.client_secret;
      console.log("[Create Subscription] Using SetupIntent client secret");
    }

    if (!clientSecret) {
      console.error("[Create Subscription] Failed to get client secret after all attempts");
      console.error("[Create Subscription] Subscription:", subscription.id, "Status:", subscription.status);
      console.error("[Create Subscription] Invoice:", invoice?.id, "Status:", invoice?.status, "Amount Due:", invoice?.amount_due);
      console.error("[Create Subscription] Invoice payment_intent:", invoice ? (invoice as any).payment_intent : undefined);
      console.error("[Create Subscription] Pending setup intent:", subscription.pending_setup_intent);
      
      return NextResponse.json(
        { error: "Failed to initialize payment. Please try again." },
        { status: 500 }
      );
    }

    console.log("[Create Subscription] Success! Returning subscription and client secret");
    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
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

