import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Try to use service role client first (bypasses RLS)
    let supabase;
    try {
      supabase = createSupabaseServiceRoleClient();
      console.log("[Admin Memberships API] Using service role client");
    } catch (serviceRoleError: any) {
      console.warn("[Admin Memberships API] Service role key not available, using regular client");
      supabase = await createSupabaseServerComponentClient();
    }

    // Fetch all memberships
    const { data: membershipsData, error: membershipsError } = await supabase
      .from("user_memberships")
      .select("*")
      .order("updated_at", { ascending: false });

    if (membershipsError) {
      console.error("[Admin Memberships API] Error fetching memberships:", membershipsError);
      return NextResponse.json(
        { error: membershipsError.message || "Failed to fetch memberships" },
        { status: 500 }
      );
    }

    if (!membershipsData || membershipsData.length === 0) {
      console.log("[Admin Memberships API] No memberships found");
      return NextResponse.json({ memberships: [] });
    }

    console.log("[Admin Memberships API] Found", membershipsData.length, "memberships");

    // Get unique user IDs and membership plan IDs
    const userIds = [...new Set(membershipsData.map((m: any) => m.user_id).filter(Boolean))];
    const planIds = [...new Set(membershipsData.map((m: any) => m.membership_plan_id).filter(Boolean))];

    console.log("[Admin Memberships API] Fetching", userIds.length, "users and", planIds.length, "plans");

    // Fetch users and plans in parallel
    const [usersResult, plansResult] = await Promise.all([
      userIds.length > 0
        ? supabase
            .from("users")
            .select("id, full_name, email")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      planIds.length > 0
        ? supabase
            .from("membership_plans")
            .select("id, name, plan_type, monthly_price")
            .in("id", planIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (usersResult.error) {
      console.error("[Admin Memberships API] Error fetching users:", usersResult.error);
    }
    if (plansResult.error) {
      console.error("[Admin Memberships API] Error fetching plans:", plansResult.error);
    }

    // Create lookup maps
    const usersMap = new Map((usersResult.data || []).map((u: any) => [u.id, u]));
    const plansMap = new Map((plansResult.data || []).map((p: any) => [p.id, p]));

    console.log("[Admin Memberships API] Mapped", usersMap.size, "users and", plansMap.size, "plans");

    // Combine the data
    const enrichedMemberships = membershipsData.map((membership: any) => ({
      ...membership,
      user: usersMap.get(membership.user_id) || null,
      membership_plan: plansMap.get(membership.membership_plan_id) || null,
    }));

    return NextResponse.json({ memberships: enrichedMemberships });
  } catch (error: any) {
    console.error("[Admin Memberships API] Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

