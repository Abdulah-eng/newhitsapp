import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { is_active } = await request.json();

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "is_active must be a boolean" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Update user in users table
    const { error: userError } = await supabase
      .from("users")
      .update({ is_active })
      .eq("id", id);

    if (userError) {
      console.error("Error updating user:", userError);
      return NextResponse.json(
        { error: "Failed to update user status" },
        { status: 500 }
      );
    }

    // If deactivating, also update auth user to prevent login
    // Note: Supabase Auth doesn't have a direct "deactivate" flag,
    // but we can check is_active in the users table at login time
    // For now, we'll just update the users table

    return NextResponse.json({
      success: true,
      message: `User ${is_active ? "activated" : "deactivated"} successfully`,
    });
  } catch (error: any) {
    console.error("Error in deactivate user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

