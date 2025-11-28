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
    const { userId, email, fullName, role, phone } = body;

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
        return NextResponse.json({ success: true, message: "User already exists" });
      }

      console.error("Error creating user record:", error);
      return NextResponse.json(
        { error: "Failed to create user record", details: error.message },
        { status: 500 }
      );
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

