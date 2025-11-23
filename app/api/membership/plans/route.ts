import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";

/**
 * GET /api/membership/plans
 * Fetch membership plans, optionally filtered by service_category
 * Query params:
 *   - category: 'online-only' | 'in-person' (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerComponentClient();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") as "online-only" | "in-person" | null;

    let query = supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .order("monthly_price", { ascending: true });

    // Filter by service category if provided
    if (category) {
      query = query.eq("service_category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching membership plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch membership plans" },
        { status: 500 }
      );
    }

    // Parse features JSONB
    const plans = (data || []).map((plan) => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : [],
    }));

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("Unexpected error fetching membership plans:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

