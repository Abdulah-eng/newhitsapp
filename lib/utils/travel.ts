/**
 * Travel Distance Calculation Utilities
 * HITS Headquarters: Hope Mills, NC 28348
 * Coordinates: Latitude: 34.892007, Longitude: -78.880128
 */

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
  const baseHourlyRate = 90.00;
  const additional30MinRate = 45.00;
  
  const hourlyRate = isMember && memberHourlyRate ? memberHourlyRate : baseHourlyRate;
  
  if (durationMinutes <= 60) {
    return hourlyRate;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const extraMinutes = durationMinutes % 60;
  const basePrice = hours * hourlyRate;
  
  if (extraMinutes > 0) {
    // Calculate additional 30-minute increments
    const additional30MinIncrements = Math.ceil(extraMinutes / 30);
    const additionalRate = isMember && memberHourlyRate 
      ? (memberHourlyRate / 2) * additional30MinIncrements
      : additional30MinRate * additional30MinIncrements;
    return basePrice + additionalRate;
  }
  
  return basePrice;
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

