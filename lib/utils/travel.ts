/**
 * Travel Distance Calculation Utilities
 * HITS Headquarters: Hope Mills, NC 28348
 * Coordinates: Latitude: 34.892007, Longitude: -78.880128
 */
import { AllowedPlanType, CANONICAL_MEMBERSHIP_PLANS, MEMBER_HOURLY_RATE } from "@/lib/constants/memberships";

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
}

interface PricingResult {
  servicePrice: number;
  membershipDiscount: number;
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
 * Calculates full pricing breakdown with membership rules:
 * - Standard: $95 first 60 min, $45 each additional 30 min (rounded up)
 * - Family Care+: First 60 min FREE per billing cycle, then $75/hour prorated
 * - Comfort: 25% off entire service price
 * - Connect: 10% off entire service price
 * - Member discount is informational only (shows savings vs non-member)
 * - Subtotal uses member pricing, discount does NOT reduce subtotal
 * - Tax (7% NC) applied to member subtotal only
 */
export function calculateAppointmentPricing({
  durationMinutes,
  travelFee = 0,
  locationType = "remote",
  membershipPlan,
  freeMinutesAvailable = 0, // First free 60 minutes for Family Care+ (per billing cycle)
}: PricingInput & { freeMinutesAvailable?: number }): PricingResult {
  // Calculate non-member standard price: $95 first 60 min, $45 per additional 30 min
  const nonMemberPrice = calculateStandardPrice(durationMinutes);
  
  const planType = membershipPlan?.plan_type as AllowedPlanType | undefined;
  let servicePrice = nonMemberPrice; // Default to non-member pricing
  let membershipDiscount = 0; // Informational only - shows savings
  let freeMinutesApplied = 0;

  if (planType === "family_care_plus") {
    // Family Care+: First 60 min FREE, then $75/hour prorated for additional time
    freeMinutesApplied = Math.min(freeMinutesAvailable, durationMinutes);
    const billableMinutes = Math.max(durationMinutes - freeMinutesApplied, 0);
    
    // Member pays $75/hour (prorated) for billable time
    servicePrice = (billableMinutes / 60) * MEMBER_HOURLY_RATE;
    
    // Discount is informational: shows savings vs non-member (does NOT affect subtotal)
    membershipDiscount = Math.max(nonMemberPrice - servicePrice, 0);
  } else if (planType === "comfort") {
    // Comfort: 25% off entire service price
    membershipDiscount = nonMemberPrice * 0.25;
    servicePrice = Math.max(nonMemberPrice - membershipDiscount, 0);
  } else if (planType === "connect") {
    // Connect: 10% off entire service price
    membershipDiscount = nonMemberPrice * 0.10;
    servicePrice = Math.max(nonMemberPrice - membershipDiscount, 0);
  }

  // Subtotal = member service price + travel fee (discount does NOT reduce subtotal)
  const subtotal = Math.max(servicePrice + travelFee, 0);
  
  // Tax (7% NC) applied to member subtotal only
  const tax = subtotal * 0.07;
  
  // Total = subtotal + tax
  const total = subtotal + tax;

  return {
    servicePrice,
    membershipDiscount,
    freeMinutesApplied,
    subtotal,
    tax,
    total,
  };
}

