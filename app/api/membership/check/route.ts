import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { stripe } from "@/lib/stripe/client";

/**
 * Check if membership is active for a given subscription
 * Used after payment to verify webhook has processed
 * Also checks Stripe subscription status as fallback
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get("subscriptionId");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerComponentClient();

    // Check if membership exists and is active
    const { data: membership, error } = await supabase
      .from("user_memberships")
      .select("id, status, membership_plan_id")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error checking membership:", error);
      return NextResponse.json(
        { error: "Failed to check membership" },
        { status: 500 }
      );
    }

    // If membership exists and is active, return success
    if (membership?.status === "active") {
      return NextResponse.json({
        membershipActive: true,
        membershipId: membership.id,
      });
    }

    // If membership doesn't exist but subscription is active in Stripe,
    // the webhook might not have processed yet - check Stripe directly
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (subscription.status === "active" && !membership) {
        // Subscription is active in Stripe but membership not created yet
        // This means webhook hasn't processed - return false but indicate subscription is active
        return NextResponse.json({
          membershipActive: false,
          subscriptionActive: true,
          message: "Payment processed, membership activation in progress...",
        });
      }

      // Subscription is not active
      return NextResponse.json({
        membershipActive: false,
        subscriptionActive: false,
      });
    } catch (stripeError: any) {
      console.error("Error checking Stripe subscription:", stripeError);
      // If we can't check Stripe, just return membership status
      return NextResponse.json({
        membershipActive: membership?.status === "active" || false,
        membershipId: membership?.id,
      });
    }
  } catch (error: any) {
    console.error("Error in membership check:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

