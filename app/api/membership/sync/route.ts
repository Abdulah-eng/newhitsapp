import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { stripe } from "@/lib/stripe/client";
import { logMembershipCreated } from "@/lib/utils/activityLogger";

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

    // Check if membership already exists
    const { data: existingMembership } = await supabase
      .from("user_memberships")
      .select("*")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json({
        success: true,
        membershipId: existingMembership.id,
        message: "Membership already exists",
      });
    }

    // Retrieve subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    if (subscription.status !== "active") {
      return NextResponse.json(
        { error: "Subscription is not active" },
        { status: 400 }
      );
    }

    const userId = subscription.metadata.user_id;
    const membershipPlanId = subscription.metadata.membership_plan_id;

    if (!userId || !membershipPlanId || userId !== user.id) {
      return NextResponse.json(
        { error: "Invalid subscription metadata" },
        { status: 400 }
      );
    }

    // Create membership manually
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
        next_billing_date: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString().split("T")[0]
          : null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating membership:", createError);
      return NextResponse.json(
        { error: "Failed to create membership" },
        { status: 500 }
      );
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

