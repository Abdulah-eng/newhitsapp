# Google Maps API Integration Documentation

## Overview

The HITS platform uses Google Maps APIs to calculate travel distances and fees for in-person appointments. This document describes the integration, setup, and billing details.

## APIs Used

### 1. Distance Matrix API
- **Purpose**: Calculate driving distance from HITS headquarters to client addresses
- **Usage**: Server-side calculation for travel fee computation
- **Endpoint**: `https://maps.googleapis.com/maps/api/distancematrix/json`

### 2. Maps JavaScript API (Frontend)
- **Purpose**: Display maps and enable location selection in the booking flow
- **Usage**: Client-side map rendering and geocoding
- **Status**: Configured but primarily used for UI/UX

## API Keys

The platform uses two separate API keys for security and best practices:

1. **Backend Key** (`GOOGLE_MAPS_BACKEND_KEY`)
   - Used for server-side Distance Matrix API calls
   - Restricted to specific APIs (Distance Matrix)
   - Stored in environment variables (not exposed to client)

2. **Frontend Key** (`NEXT_PUBLIC_GOOGLE_MAPS_FRONTEND_KEY`)
   - Used for client-side Maps JavaScript API
   - Can be restricted by HTTP referrer
   - Exposed in client-side code

## Implementation Details

### Travel Distance Calculation

**Location**: `app/api/travel/calculate/route.ts`

**Process**:
1. Client submits appointment booking with address
2. Server receives address and extracts coordinates
3. Server calls Distance Matrix API with:
   - Origin: HITS HQ (Hope Mills, NC 28348) - Coordinates: `34.892007,-78.880128`
   - Destination: Client address
   - Mode: `driving`
4. API returns distance in miles
5. System calculates travel fee based on distance

### Travel Fee Logic

**Pricing Structure**:
- **First 20 miles**: Included (no fee)
- **Beyond 20 miles**: $1.00 per mile (round-trip)
- **Tech payout**: $0.60 per mile
- **Company retention**: $0.40 per mile

**Calculation**:
```javascript
const miles = distanceInMiles;
const milesBeyond20 = Math.max(0, miles - 20);
const travelFee = milesBeyond20 * 1.00; // $1.00 per mile
const techPayout = milesBeyond20 * 0.60;
const companyRetention = milesBeyond20 * 0.40;
```

### Headquarters Coordinates

- **Address**: Hope Mills, NC 28348
- **Latitude**: 34.892007
- **Longitude**: -78.880128
- **Format**: `"34.892007,-78.880128"` (used in API calls)

## Billing and Limits

### Google Maps Platform Pricing

**Distance Matrix API**:
- First 40,000 requests per month: Free
- $5.00 per 1,000 requests after free tier
- Each appointment booking = 1 request

**Maps JavaScript API**:
- First 28,000 map loads per month: Free
- $7.00 per 1,000 map loads after free tier

### Estimated Monthly Costs

For a platform with:
- 100 appointments per month
- Average 2 map views per booking

**Distance Matrix**: 100 requests = $0 (within free tier)
**Maps JavaScript**: 200 map loads = $0 (within free tier)

**Total**: $0/month (within free tiers)

### Monitoring Usage

1. **Google Cloud Console**: 
   - Navigate to APIs & Services > Dashboard
   - Monitor usage for Distance Matrix and Maps JavaScript APIs
   - Set up billing alerts

2. **Application Logs**:
   - Check `app/api/travel/calculate/route.ts` for API call logs
   - Monitor error rates and response times

## Environment Variables

Add to `.env.local` (or production environment):

```bash
# Google Maps API Keys
GOOGLE_MAPS_BACKEND_KEY=your_backend_key_here
NEXT_PUBLIC_GOOGLE_MAPS_FRONTEND_KEY=your_frontend_key_here
```

## Security Best Practices

1. **Backend Key Restrictions**:
   - Restrict to Distance Matrix API only
   - Restrict by IP address (if using fixed server IPs)
   - Never expose in client-side code

2. **Frontend Key Restrictions**:
   - Restrict by HTTP referrer (your domain)
   - Restrict to Maps JavaScript API only
   - Monitor usage for unusual patterns

3. **Rate Limiting**:
   - Implement rate limiting on `/api/travel/calculate` endpoint
   - Cache distance calculations when possible
   - Handle API errors gracefully

## Error Handling

The system handles the following error scenarios:

1. **API Key Invalid**: Returns error, prevents booking
2. **Address Not Found**: Returns error, prompts user to verify address
3. **API Quota Exceeded**: Returns error, logs for admin review
4. **Network Timeout**: Retries once, then returns error

## Testing

### Test Addresses (Within 20-mile radius - No Fee)

- Fayetteville, NC 28301
- Spring Lake, NC 28390
- Raeford, NC 28376
- Stedman, NC 28391

### Test Addresses (Beyond 20 miles - Fee Applies)

- Raleigh, NC 27601 (approx. 60 miles)
- Charlotte, NC 28202 (approx. 150 miles)
- Wilmington, NC 28401 (approx. 90 miles)

## Maintenance

### Updating HQ Coordinates

If HITS headquarters moves:

1. Update coordinates in `lib/utils/travel.ts`:
   ```typescript
   export const HQ_COORDINATES = {
     lat: 34.892007,
     lng: -78.880128,
     coordinates: "34.892007,-78.880128"
   };
   ```

2. Update coordinates in `app/api/travel/calculate/route.ts`:
   ```typescript
   const origin = "34.892007,-78.880128";
   ```

3. Test with known addresses to verify calculations

### Updating Pricing

To change travel fee rates:

1. Update calculation logic in `app/api/travel/calculate/route.ts`
2. Update pricing display in booking flow
3. Update documentation (this file and FAQ page)

## Support

For issues with Google Maps API:
- Check Google Cloud Console for API status
- Review API quotas and billing
- Contact Google Cloud Support if needed

For issues with HITS travel calculation:
- Check application logs
- Verify environment variables are set
- Test with known addresses

