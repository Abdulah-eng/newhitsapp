/**
 * Travel Distance Calculation Utilities
 * HITS Headquarters: Hope Mills, NC 28348
 * Coordinates: Latitude: 34.892007, Longitude: -78.880128
 */
import { AllowedPlanType, CANONICAL_MEMBERSHIP_PLANS } from "@/lib/constants/memberships";

export const HITS_HEADQUARTERS = {
  address: "Hope Mills, NC 28348",
  lat: 34.892007,
  lng: -78.880128,
  coordinates: "34.892007,-78.880128",
};

export const TRAVEL_CONFIG = {
  includedMiles: 20,
  clientRatePerMile: 1.00,
  specialistReimbursementPerMile: 0.60,
};

/**
 * Calculate travel fee for client
 * @param distanceMiles - Distance in miles
 * @returns Travel fee amount (0 if within included miles)
 */
export function calculateTravelFee(distanceMiles: number): number {
  if (distanceMiles <= TRAVEL_CONFIG.includedMiles) {
    return 0;
  }
  const extraMiles = distanceMiles - TRAVEL_CONFIG.includedMiles;
  return extraMiles * TRAVEL_CONFIG.clientRatePerMile;
}

/**
 * Calculate travel reimbursement for specialist
 * @param distanceMiles - Distance in miles
 * @returns Reimbursement amount (0 if within included miles)
 */
export function calculateSpecialistReimbursement(distanceMiles: number): number {
  if (distanceMiles <= TRAVEL_CONFIG.includedMiles) {
    return 0;
  }
  const extraMiles = distanceMiles - TRAVEL_CONFIG.includedMiles;
  return extraMiles * TRAVEL_CONFIG.specialistReimbursementPerMile;
}

/**
 * Format address for Google Maps
 */
export function formatAddressForMaps(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string
): string {
  const parts = [address];
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  return parts.join(", ");
}

/**
 * Generate Google Maps directions URL
 */
export function getDirectionsUrl(
  destinationAddress: string,
  destinationCity?: string,
  destinationState?: string,
  destinationZip?: string
): string {
  const destination = formatAddressForMaps(
    destinationAddress,
    destinationCity,
    destinationState,
    destinationZip
  );
  const origin = HITS_HEADQUARTERS.address;
  return `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
}

/**
 * Calculate base price for appointment
 * Pricing: $95 for first hour, $45 per hour for additional hours
 * @param durationMinutes - Duration in minutes
 * @param isMember - Whether user has active membership
 * @param memberHourlyRate - Member hourly rate if applicable
 * @returns Base price before travel fees
 */
export function calculateBasePrice(
  durationMinutes: number,
  isMember: boolean = false,
  memberHourlyRate?: number
): number {
  const firstHourRate = 95.0;
  const additionalHalfHourRate = 45.0;

  // Non-member pricing: $95 for first hour, $45 per 30 minutes after (rounded up to next 30)
  if (!isMember) {
    if (durationMinutes <= 0) return 0;
    if (durationMinutes <= 60) return firstHourRate;
    const extraMinutes = durationMinutes - 60;
    const extraBlocks = Math.ceil(extraMinutes / 30);
    return firstHourRate + extraBlocks * additionalHalfHourRate;
  }

  // Legacy member pricing (kept for backward compatibility with existing callers)
  const rate = memberHourlyRate || 75;
  return (durationMinutes / 60) * rate;
}

/**
 * Calculate total price including travel fee
 */
export function calculateTotalPrice(
  basePrice: number,
  travelFee: number,
  memberDiscount: number = 0
): number {
  return basePrice + travelFee - memberDiscount;
}

// ---- New membership-aware pricing helpers ----

interface PricingInput {
  durationMinutes: number;
  travelFee?: number;
  locationType?: "remote" | "in-person";
  membershipPlan?: {
    plan_type?: AllowedPlanType | string | null;
    included_visit_minutes?: number | null;
  } | null;
  freeMinutesAvailable?: number; // For Family Care+: available free minutes in current billing cycle
  isFirstVisitEver?: boolean; // True if user has 0 completed appointments
  isFirstUseOnline?: boolean; // True if first time using online plan benefit
}

interface PricingResult {
  servicePrice: number; // Member price charged
  regularPrice: number; // Non-member price (for display)
  membershipDiscount: number; // Informational savings amount
  freeMinutesApplied: number;
  subtotal: number;
  tax: number;
  total: number;
}

const STANDARD_FIRST_HOUR = 95;
const STANDARD_HALF_HOUR = 45;

export function calculateStandardPrice(durationMinutes: number): number {
  if (durationMinutes <= 0) return 0;
  if (durationMinutes <= 60) return STANDARD_FIRST_HOUR;
  const extraMinutes = durationMinutes - 60;
  const extraBlocks = Math.ceil(extraMinutes / 30);
  return STANDARD_FIRST_HOUR + extraBlocks * STANDARD_HALF_HOUR;
}

function resolveIncludedMinutes(planType?: AllowedPlanType | string | null, locationType?: "remote" | "in-person"): number {
  const canonical = planType ? CANONICAL_MEMBERSHIP_PLANS[planType as AllowedPlanType] : null;
  if (!canonical) return 0;

  // Comfort free time only applies to remote visits
  if (canonical.plan_type === "comfort" && locationType === "in-person") {
    return 0;
  }

  return canonical.included_visit_minutes;
}

/**
 * Calculate member price based on plan and duration
 * Rules: 
 * - 30 min = hourlyRate / 2
 * - First 60 min = hourlyRate
 * - After 60 min → each additional 30 min = hourlyRate / 2
 */
function calculateMemberPrice(durationMinutes: number, hourlyRate: number): number {
  if (durationMinutes <= 0) return 0;
  if (durationMinutes === 30) {
    return hourlyRate / 2; // 30 minutes = half hour rate
  }
  if (durationMinutes <= 60) {
    return hourlyRate; // Full hour at hourly rate
  }
  // First hour + prorated additional time (each 30 min = hourlyRate / 2)
  const additionalMinutes = durationMinutes - 60;
  const additionalHalfHours = additionalMinutes / 30;
  return hourlyRate + (additionalHalfHours * (hourlyRate / 2));
}

/**
 * Calculates full pricing breakdown with ALL membership rules:
 * - Non-member: $95 first 60 min, $45 per additional 30 min
 * - Connect: $85/hour, no free first visit
 * - Comfort: $80/hour, no free first visit
 * - Family Care+: $75/hour, first 60 min free (first visit ever) OR 60 min monthly included
 * - Comfort: $80/hour, 30 min remote included monthly
 * - Starter/Essentials: Online plans with first 30 min free
 * - Family+ Online: Unlimited remote sessions
 * - Member discount is informational only (shows savings vs non-member)
 * - Subtotal uses member pricing, discount does NOT reduce subtotal
 */
export function calculateAppointmentPricing({
  durationMinutes,
  travelFee = 0,
  locationType = "remote",
  membershipPlan,
  freeMinutesAvailable = 0,
  isFirstVisitEver = false,
  isFirstUseOnline = false,
}: PricingInput): PricingResult {
  // Calculate non-member standard price: $95 first 60 min, $45 per additional 30 min
  const regularPrice = calculateStandardPrice(durationMinutes);
  
  const planType = membershipPlan?.plan_type as AllowedPlanType | undefined;
  const canonical = planType ? CANONICAL_MEMBERSHIP_PLANS[planType as AllowedPlanType] : null;
  
  let servicePrice = regularPrice; // Default to non-member pricing
  let membershipDiscount = 0; // Informational only - shows savings
  let freeMinutesApplied = 0;

  if (!canonical) {
    // No membership - use regular pricing
    const subtotal = Math.max(servicePrice + travelFee, 0);
    const tax = subtotal * 0.07;
    return {
      servicePrice,
      regularPrice,
      membershipDiscount: 0,
      freeMinutesApplied: 0,
      subtotal,
      tax,
      total: subtotal + tax,
    };
  }

  // Handle online-only plans
  if (canonical.service_category === "online-only") {
    if (planType === "family" && locationType === "remote") {
      // Unlimited remote sessions - FREE
      servicePrice = 0;
      freeMinutesApplied = durationMinutes;
      membershipDiscount = regularPrice;
    } else if ((planType === "starter" || planType === "essential") && isFirstUseOnline) {
      // First 30 min free for first use
      freeMinutesApplied = Math.min(30, durationMinutes);
      const billableMinutes = Math.max(durationMinutes - freeMinutesApplied, 0);
      servicePrice = calculateMemberPrice(billableMinutes, canonical.member_hourly_rate);
      membershipDiscount = Math.max(regularPrice - servicePrice, 0);
    } else {
      // Regular member pricing for online plans
      servicePrice = calculateMemberPrice(durationMinutes, canonical.member_hourly_rate);
      membershipDiscount = Math.max(regularPrice - servicePrice, 0);
    }
  } 
  // Handle in-person plans
  else if (canonical.service_category === "in-person") {
    const hourlyRate = canonical.member_hourly_rate;
    
    // Check for first visit free (Family Care+ only, and only for first visit ever)
    if (planType === "family_care_plus" && isFirstVisitEver && locationType === "in-person") {
      // First 60 min FREE for first visit ever
      freeMinutesApplied = Math.min(60, durationMinutes);
      const billableMinutes = Math.max(durationMinutes - freeMinutesApplied, 0);
      servicePrice = calculateMemberPrice(billableMinutes, hourlyRate);
      membershipDiscount = Math.max(regularPrice - servicePrice, 0);
    } 
    // Check for monthly free minutes (Family Care+ or Comfort)
    else if ((planType === "family_care_plus" || (planType === "comfort" && locationType === "remote")) && freeMinutesAvailable > 0) {
      freeMinutesApplied = Math.min(freeMinutesAvailable, durationMinutes);
      const billableMinutes = Math.max(durationMinutes - freeMinutesApplied, 0);
      servicePrice = calculateMemberPrice(billableMinutes, hourlyRate);
      membershipDiscount = Math.max(regularPrice - servicePrice, 0);
    }
    // Regular member pricing
    else {
      servicePrice = calculateMemberPrice(durationMinutes, hourlyRate);
      membershipDiscount = Math.max(regularPrice - servicePrice, 0);
    }
  }

  // Subtotal = member service price + travel fee (discount does NOT reduce subtotal)
  const subtotal = Math.max(servicePrice + travelFee, 0);
  
  // Tax (7% NC) applied to member subtotal only
  const tax = subtotal * 0.07;
  
  // Total = subtotal + tax
  const total = subtotal + tax;

  return {
    servicePrice,
    regularPrice,
    membershipDiscount,
    freeMinutesApplied,
    subtotal,
    tax,
    total,
  };
}

