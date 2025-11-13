import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";

/**
 * Cancel a Stripe subscription
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, cancelImmediately } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerComponentClient();

    // Verify subscription belongs to user
    const { data: membership } = await supabase
      .from("user_memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Cancel subscription in Stripe
    let subscription;
    if (cancelImmediately) {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update membership status in database
    if (cancelImmediately || subscription.cancel_at_period_end) {
      await supabase
        .from("user_memberships")
        .update({
          status: cancelImmediately ? "cancelled" : "active",
          cancelled_at: cancelImmediately ? new Date().toISOString() : null,
          cancellation_reason: "User requested cancellation",
        })
        .eq("id", membership.id);

      if (cancelImmediately) {
        // Remove membership_id from senior profile
        await supabase
          .from("senior_profiles")
          .update({ membership_id: null })
          .eq("user_id", user.id);
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at,
      },
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

