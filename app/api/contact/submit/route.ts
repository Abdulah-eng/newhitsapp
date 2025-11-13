import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";

/**
 * Submit contact form message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, userType, topic, message } = body;

    // Validate required fields
    if (!name || !email || !userType || !topic || !message) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Get current user if logged in (don't fail if not logged in)
    let user = null;
    try {
      user = await getCurrentUser();
    } catch (userError) {
      // User not logged in is fine for contact form
      console.log("No user logged in for contact form submission");
    }
    
    // Extract IP address and user agent
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      null;
    const userAgent = request.headers.get("user-agent") || null;

    // Use service role client to bypass RLS for public contact form
    // This ensures the insert works even for anonymous users
    // Fallback to regular client if service role key is not set
    let supabase;
    try {
      supabase = createSupabaseServiceRoleClient();
    } catch (serviceRoleError) {
      console.warn("Service role key not set, using regular client. RLS policy must allow anonymous inserts.");
      supabase = await createSupabaseServerComponentClient();
    }

    // Insert contact message
    const { data: contactMessage, error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        user_type: userType,
        topic: topic,
        message: message.trim(),
        user_id: user?.id || null,
        status: "new",
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting contact message:", insertError);
      console.error("Error details:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      
      // Provide more specific error message
      let errorMessage = "Failed to submit message. Please try again.";
      if (insertError.code === "42P01") {
        errorMessage = "Database table 'contact_messages' not found. Please run the CONTACT_MESSAGES_SCHEMA.sql migration in Supabase.";
      } else if (insertError.code === "42501") {
        errorMessage = "Permission denied. Please check RLS policies for contact_messages table.";
      } else if (insertError.message) {
        errorMessage = `Error: ${insertError.message}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          errorCode: insertError.code,
          details: process.env.NODE_ENV === "development" ? {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          } : undefined
        },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/activity/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact_message_created",
          description: `Contact form submission from ${name} (${email}) - Topic: ${topic}`,
          metadata: {
            contact_message_id: contactMessage.id,
            name,
            email,
            user_type: userType,
            topic,
            user_id: user?.id || null,
          },
        }),
      });
    } catch (logError) {
      console.error("Error logging contact message activity:", logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been submitted successfully. We'll get back to you soon!",
      id: contactMessage.id,
    });
  } catch (error: any) {
    console.error("Error in contact submit API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

