import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !["verified", "rejected"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be 'verified' or 'rejected'" },
        { status: 400 }
      );
    }

    // Check if user is admin
    const supabase = await createSupabaseServerComponentClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from("specialist_profiles")
      .update({ verification_status: status })
      .eq("user_id", id);

    if (updateError) {
      console.error("Error updating verification status:", updateError);
      return NextResponse.json(
        { message: "Failed to update verification status", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Specialist ${status === "verified" ? "verified" : "rejected"} successfully`,
    });
  } catch (error: any) {
    console.error("Error in verify-specialist API:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

