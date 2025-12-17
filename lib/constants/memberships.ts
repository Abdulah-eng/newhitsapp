export type AllowedPlanType = "connect" | "comfort" | "family_care_plus" | "starter" | "essential" | "family";

export interface CanonicalPlan {
  plan_type: AllowedPlanType;
  name: string;
  monthly_price: number;
  member_hourly_rate: number; // Hourly rate for additional visits
  included_visit_minutes: number;
  included_visit_type: "remote" | "in-person" | "any";
  service_category: "in-person" | "online-only";
  has_first_visit_free: boolean; // First 60 min free for in-person plans
  has_first_30min_free: boolean; // First 30 min free for online plans
  description: string;
  features: string[];
}

// Plan-specific hourly rates
export const CONNECT_HOURLY_RATE = 85;
export const COMFORT_HOURLY_RATE = 80;
export const FAMILY_CARE_PLUS_HOURLY_RATE = 75;

export const CANONICAL_MEMBERSHIP_PLANS: Record<AllowedPlanType, CanonicalPlan> = {
  // IN-PERSON PLANS
  connect: {
    plan_type: "connect",
    name: "Connect",
    monthly_price: 25,
    member_hourly_rate: CONNECT_HOURLY_RATE, // $85/hour
    included_visit_minutes: 0,
    included_visit_type: "any",
    service_category: "in-person",
    has_first_visit_free: false,
    has_first_30min_free: false,
    description: "Member rate only, no free time included.",
    features: [
      "Member rate: $85/hour for visits",
      "Priority scheduling",
      "Access to the HITS resource library",
      "Email alerts with safety tips and scam warnings",
    ],
  },
  comfort: {
    plan_type: "comfort",
    name: "Comfort",
    monthly_price: 59,
    member_hourly_rate: COMFORT_HOURLY_RATE, // $80/hour
    included_visit_minutes: 30,
    included_visit_type: "remote",
    service_category: "in-person",
    has_first_visit_free: false,
    has_first_30min_free: false,
    description: "One 30-minute remote check-in included each month.",
    features: [
      "1 free 30-min remote check-in monthly",
      "Member rate: $80/hour for additional visits",
      "Priority same-week scheduling",
      "Optional caregiver notifications",
    ],
  },
  family_care_plus: {
    plan_type: "family_care_plus",
    name: "Family Care+",
    monthly_price: 99,
    member_hourly_rate: FAMILY_CARE_PLUS_HOURLY_RATE, // $75/hour
    included_visit_minutes: 60,
    included_visit_type: "any",
    service_category: "in-person",
    has_first_visit_free: true, // First 60 min free for first appointment ever
    has_first_30min_free: false,
    description: "One 60-minute visit (remote or in-home) included monthly.",
    features: [
      "1 free 60-min visit monthly (remote or in-home)",
      "First appointment ever = FREE (up to 60 min)",
      "Member rate: $75/hour after included time",
      "Covers up to 3 people in the household",
      "Family view of appointments and summaries",
    ],
  },
  // ONLINE-ONLY PLANS
  starter: {
    plan_type: "starter",
    name: "Starter",
    monthly_price: 39,
    member_hourly_rate: CONNECT_HOURLY_RATE, // $85/hour (uses Connect rate)
    included_visit_minutes: 0,
    included_visit_type: "remote",
    service_category: "online-only",
    has_first_visit_free: false,
    has_first_30min_free: true, // First 30 min free for first use
    description: "1 live concierge session per month. Extra sessions at member rate.",
    features: [
      "1 live concierge session per month",
      "First 30 minutes FREE for first use",
      "Extra remote sessions: $85/hour",
    ],
  },
  essential: {
    plan_type: "essential",
    name: "Essentials",
    monthly_price: 69,
    member_hourly_rate: COMFORT_HOURLY_RATE, // $80/hour (uses Comfort rate)
    included_visit_minutes: 0,
    included_visit_type: "remote",
    service_category: "online-only",
    has_first_visit_free: false,
    has_first_30min_free: true, // First 30 min free for first use
    description: "3 live concierge sessions per month. Extra sessions at member rate.",
    features: [
      "3 live concierge sessions per month",
      "First 30 minutes FREE for first use",
      "Extra remote sessions: $80/hour",
    ],
  },
  family: {
    plan_type: "family",
    name: "Family+",
    monthly_price: 119,
    member_hourly_rate: 0, // Unlimited - no per-session billing
    included_visit_minutes: 999999, // Effectively unlimited
    included_visit_type: "remote",
    service_category: "online-only",
    has_first_visit_free: false,
    has_first_30min_free: false,
    description: "Unlimited remote sessions included. Only charge for in-person visits.",
    features: [
      "Unlimited remote sessions included",
      "No per-session billing for remote visits",
      "In-person visits use standard in-person rates",
    ],
  },
};

export const ALLOWED_PLAN_TYPES = Object.keys(CANONICAL_MEMBERSHIP_PLANS) as AllowedPlanType[];

export function getCanonicalPlan(planType: AllowedPlanType | string | null | undefined) {
  if (!planType) return null;
  return CANONICAL_MEMBERSHIP_PLANS[planType as AllowedPlanType] || null;
}

