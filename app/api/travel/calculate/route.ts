import { NextRequest, NextResponse } from "next/server";

/**
 * Calculate travel distance from HITS headquarters to client address
 * Uses Google Maps Distance Matrix API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, city, state, zipCode } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Format destination address
    const destinationParts = [address];
    if (city) destinationParts.push(city);
    if (state) destinationParts.push(state);
    if (zipCode) destinationParts.push(zipCode);
    const destination = destinationParts.join(", ");

    // HITS Headquarters coordinates
    // Latitude: 34.892007, Longitude: -78.880128
    const origin = "34.892007,-78.880128";

    // Use Google Maps Distance Matrix API with backend key
    // Note: Use GOOGLE_MAPS_BACKEND_KEY for server-side API calls
    const apiKey = process.env.GOOGLE_MAPS_BACKEND_KEY || process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn("GOOGLE_MAPS_BACKEND_KEY not set, using fallback calculation");
      
      return NextResponse.json({
        distanceMiles: null,
        error: "Google Maps API key not configured. Please configure GOOGLE_MAPS_BACKEND_KEY in environment variables.",
      });
    }

    // Google Maps Distance Matrix API endpoint
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=imperial&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.rows[0] || !data.rows[0].elements[0]) {
      console.error("Google Maps API error:", data);
      return NextResponse.json(
        { error: "Unable to calculate distance. Please verify the address." },
        { status: 400 }
      );
    }

    const element = data.rows[0].elements[0];
    
    if (element.status !== "OK") {
      return NextResponse.json(
        { error: "Unable to calculate distance. Please verify the address." },
        { status: 400 }
      );
    }

    // Convert distance from meters to miles
    const distanceMeters = element.distance.value;
    const distanceMiles = distanceMeters * 0.000621371;

    // Calculate travel fee and reimbursements
    // Pricing structure:
    // - First 20 miles included (no charge)
    // - After 20 miles: $1.00 per mile (client pays)
    // - Tech payout: $0.60 per mile
    // - Company retention: $0.40 per mile ($1.00 - $0.60)
    const includedMiles = 20;
    let travelFee = 0;
    let specialistReimbursement = 0;
    let companyRetention = 0;
    
    if (distanceMiles > includedMiles) {
      const extraMiles = distanceMiles - includedMiles;
      travelFee = extraMiles * 1.00; // $1.00 per mile (client pays)
      specialistReimbursement = extraMiles * 0.60; // $0.60 per mile (tech payout)
      companyRetention = extraMiles * 0.40; // $0.40 per mile (company retention)
    }

    return NextResponse.json({
      distanceMiles: Math.round(distanceMiles * 100) / 100, // Round to 2 decimal places
      travelFee: Math.round(travelFee * 100) / 100,
      specialistReimbursement: Math.round(specialistReimbursement * 100) / 100,
      companyRetention: Math.round(companyRetention * 100) / 100,
      includedMiles,
      origin,
      destination,
    });
  } catch (error) {
    console.error("Error calculating travel distance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

