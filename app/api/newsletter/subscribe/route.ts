import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

/**
 * Newsletter subscription endpoint
 * Handles email subscriptions from the footer form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscriptions")
      .select("id, is_active")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: "This email is already subscribed to our newsletter" },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from("newsletter_subscriptions")
          .update({
            is_active: true,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error reactivating subscription:", updateError);
          return NextResponse.json(
            { error: "Failed to subscribe. Please try again." },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Successfully resubscribed to our newsletter!",
        });
      }
    }

    // Create new subscription
    const { error: insertError } = await supabase
      .from("newsletter_subscriptions")
      .insert({
        email: normalizedEmail,
        is_active: true,
        source: "website_footer",
      });

    if (insertError) {
      console.error("Error creating newsletter subscription:", insertError);
      
      // Handle unique constraint violation
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "This email is already subscribed to our newsletter" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to our newsletter!",
    });
  } catch (error: any) {
    console.error("Error in newsletter subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

