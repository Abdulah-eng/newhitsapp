import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { ALLOWED_PLAN_TYPES, CANONICAL_MEMBERSHIP_PLANS, MEMBER_HOURLY_RATE } from "@/lib/constants/memberships";

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

    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .in("plan_type", ALLOWED_PLAN_TYPES)
      .order("monthly_price", { ascending: true });

    if (error) {
      console.error("Error fetching membership plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch membership plans" },
        { status: 500 }
      );
    }

    // Enforce canonical pricing/features and strip unsupported plans
    const plans = (data || [])
      .filter((plan) => ALLOWED_PLAN_TYPES.includes(plan.plan_type as any))
      .map((plan) => {
        const planType = plan.plan_type as typeof ALLOWED_PLAN_TYPES[number];
        const canonical = CANONICAL_MEMBERSHIP_PLANS[planType];
        return {
          ...plan,
          name: canonical.name,
          monthly_price: canonical.monthly_price,
          member_hourly_rate: MEMBER_HOURLY_RATE,
          included_visit_minutes: canonical.included_visit_minutes,
          included_visit_type: canonical.included_visit_type,
          description: canonical.description,
          features: canonical.features,
          service_category: "in-person",
        };
      })
      .sort((a, b) => a.monthly_price - b.monthly_price);

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("Unexpected error fetching membership plans:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

