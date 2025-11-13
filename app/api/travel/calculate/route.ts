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

    // HITS Headquarters: Hope Mills, NC 28348
    const origin = "Hope Mills, NC 28348";

    // Use Google Maps Distance Matrix API
    // Note: You'll need to add GOOGLE_MAPS_API_KEY to your environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      // Fallback: Use a simple calculation based on coordinates if API key is not available
      // This is a rough estimate and should be replaced with actual API call
      console.warn("GOOGLE_MAPS_API_KEY not set, using fallback calculation");
      
      // For now, return a placeholder that indicates API key is needed
      // In production, you should implement the actual Google Maps API call
      return NextResponse.json({
        distanceMiles: null,
        error: "Google Maps API key not configured. Please configure GOOGLE_MAPS_API_KEY in environment variables.",
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

    // Calculate travel fee
    const includedMiles = 20;
    let travelFee = 0;
    if (distanceMiles > includedMiles) {
      const extraMiles = distanceMiles - includedMiles;
      travelFee = extraMiles * 1.00; // $1.00 per mile
    }

    // Calculate specialist reimbursement
    let specialistReimbursement = 0;
    if (distanceMiles > includedMiles) {
      const extraMiles = distanceMiles - includedMiles;
      specialistReimbursement = extraMiles * 0.60; // $0.60 per mile
    }

    return NextResponse.json({
      distanceMiles: Math.round(distanceMiles * 100) / 100, // Round to 2 decimal places
      travelFee: Math.round(travelFee * 100) / 100,
      specialistReimbursement: Math.round(specialistReimbursement * 100) / 100,
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

