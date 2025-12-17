import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

/**
 * API route to create a user record in the users table
 * This bypasses RLS and is called after auth signup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, fullName, role, phone, isDisabledAdult } = body;

    if (!userId || !email || !fullName || !role) {
      return NextResponse.json(
        { error: "Missing required fields: userId, email, fullName, role" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createSupabaseServiceRoleClient();

    // Insert user record
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role: role as UserRole,
        phone: phone || null,
      })
      .select()
      .single();

    if (error) {
      // If user already exists (from trigger), that's okay
      if (error.code === "23505") {
        console.log("User already exists, continuing...");
      } else {
        console.error("Error creating user record:", error);
        return NextResponse.json(
          { error: "Failed to create user record", details: error.message },
          { status: 500 }
        );
      }
    }

    // Create role-specific profile for senior users
    // Do this regardless of whether the user record was just created or already existed
    if (role === "senior") {
      // First check if senior profile already exists
      const { data: existingProfile } = await supabase
        .from("senior_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from("senior_profiles")
          .insert({
            user_id: userId,
            is_disabled_adult: isDisabledAdult || false,
          });

        if (profileError) {
          console.error("Error creating senior profile:", profileError);
          // Don't fail the whole request if profile creation fails
          // The user can still log in and create profile later
        } else {
          console.log("Senior profile created successfully");
        }
      } else {
        console.log("Senior profile already exists");
      }
    } else if (role === "specialist") {
      // First check if specialist profile already exists
      const { data: existingProfile } = await supabase
        .from("specialist_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from("specialist_profiles")
          .insert({
            user_id: userId,
          });

        if (profileError) {
          console.error("Error creating specialist profile:", profileError);
          // Don't fail the whole request if profile creation fails
        } else {
          console.log("Specialist profile created successfully");
        }
      } else {
        console.log("Specialist profile already exists");
      }
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    console.error("Error in create user API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}