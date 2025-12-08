export type AllowedPlanType = "connect" | "comfort" | "family_care_plus";

export interface CanonicalPlan {
  plan_type: AllowedPlanType;
  name: string;
  monthly_price: number;
  member_hourly_rate: number;
  included_visit_minutes: number;
  included_visit_type: "remote" | "in-person" | "any";
  description: string;
  features: string[];
}

export const MEMBER_HOURLY_RATE = 75;

export const CANONICAL_MEMBERSHIP_PLANS: Record<AllowedPlanType, CanonicalPlan> = {
  connect: {
    plan_type: "connect",
    name: "Connect",
    monthly_price: 25,
    member_hourly_rate: MEMBER_HOURLY_RATE,
    included_visit_minutes: 0,
    included_visit_type: "any",
    description: "Member rate only, no free time included.",
    features: [
      "Member rate: $75/hour for visits",
      "Priority scheduling",
      "Access to the HITS resource library",
      "Email alerts with safety tips and scam warnings",
    ],
  },
  comfort: {
    plan_type: "comfort",
    name: "Comfort",
    monthly_price: 59,
    member_hourly_rate: MEMBER_HOURLY_RATE,
    included_visit_minutes: 30,
    included_visit_type: "remote",
    description: "One 30-minute remote check-in included each month.",
    features: [
      "1 free 30-min remote check-in monthly",
      "Member rate: $75/hour for additional visits",
      "Priority same-week scheduling",
      "Optional caregiver notifications",
    ],
  },
  family_care_plus: {
    plan_type: "family_care_plus",
    name: "Family Care+",
    monthly_price: 99,
    member_hourly_rate: MEMBER_HOURLY_RATE,
    included_visit_minutes: 60,
    included_visit_type: "any",
    description: "One 60-minute visit (remote or in-home) included monthly.",
    features: [
      "1 free 60-min visit monthly (remote or in-home)",
      "Member rate: $75/hour after included time",
      "Covers up to 3 people in the household",
      "Family view of appointments and summaries",
    ],
  },
};

export const ALLOWED_PLAN_TYPES = Object.keys(CANONICAL_MEMBERSHIP_PLANS) as AllowedPlanType[];

export function getCanonicalPlan(planType: AllowedPlanType | string | null | undefined) {
  if (!planType) return null;
  return CANONICAL_MEMBERSHIP_PLANS[planType as AllowedPlanType] || null;
}

