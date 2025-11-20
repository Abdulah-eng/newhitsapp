import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, full_name, role, phone } = await request.json();

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: "Email, full_name, and role are required" },
        { status: 400 }
      );
    }

    if (!["senior", "specialist", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be senior, specialist, or admin" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const temporaryPassword = email;

    // Create auth user with default password (email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Create user record in users table
    const { error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        full_name,
        role,
        phone: phone || null,
        is_active: true,
      });

    if (userError) {
      console.error("Error creating user record:", userError);
      // Try to clean up auth user if possible
      return NextResponse.json(
        { error: "Failed to create user record" },
        { status: 500 }
      );
    }

    // If role is specialist, create specialist profile placeholder
    if (role === "specialist") {
      await supabase.from("specialist_profiles").insert({
        user_id: authData.user.id,
        verification_status: "pending",
        hourly_rate: 0,
        specialties: [],
      });
    }

    // If role is senior, create senior profile placeholder
    if (role === "senior") {
      await supabase.from("senior_profiles").insert({
        user_id: authData.user.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully. Default password is their email address.",
      user: {
        id: authData.user.id,
        email,
        full_name,
        role,
      },
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

