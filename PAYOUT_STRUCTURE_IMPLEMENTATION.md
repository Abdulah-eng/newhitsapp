# Payout Structure Implementation

## Overview
This document describes the implementation of the new payout structure for HITS, where all payments go to the HITS main Stripe account, and specialists receive calculated payouts ($30/hr + $0.60/mile) while the company retains the remainder.

## Key Changes

### 1. Database Schema Updates
**File:** `PAYOUT_STRUCTURE_UPDATE.sql`

Added new columns to the `payments` table:
- `hours_worked` - Hours worked by specialist (from duration_minutes)
- `mileage` - Total miles traveled (round trip)
- `tech_pay` - Specialist hourly pay ($30/hr)
- `mileage_pay` - Specialist travel reimbursement ($0.60/mile after 20 miles)
- `company_revenue` - Company revenue (total - tech_pay - mileage_pay - tax)
- `tax_amount` - Tax amount collected (7% NC tax)
- `base_service_amount` - Base service fee (before tax and travel)
- `travel_fee_amount` - Travel fee charged to client ($1.00/mile after 20 miles)

**To apply:** Run the SQL migration file in your Supabase SQL editor.

### 2. Stripe Payment Intent Creation
**File:** `lib/stripe/client.ts`

**Changes:**
- Added Stripe Tax API integration for NC service tax (7%: 4.75% state + 2.25% Cumberland County)
- Payment intents now include tax calculation
- All payments go to HITS main account only (no destination charges or automatic payouts)
- Metadata includes `base_amount`, `travel_fee`, and `tax_amount` for payout calculations

**Key Features:**
- Uses Stripe Tax API when shipping address is available
- Falls back to manual 7% calculation if Stripe Tax fails
- Tax is calculated on base service + travel fee
- Returns payment intent with `calculatedTax` and `taxCalculationId`

### 3. Payment Intent API Route
**File:** `app/api/stripe/create-payment-intent/route.ts`

**Changes:**
- Fetches appointment details including `base_price`, `travel_fee`, and address
- Passes shipping address to Stripe Tax API for accurate tax calculation
- Returns tax amount to frontend for display

### 4. Webhook Handler
**File:** `app/api/stripe/webhook/route.ts`

**Changes:**
- Calculates payout structure when payment succeeds:
  - `hours_worked` = duration_minutes / 60
  - `tech_pay` = hours_worked * $30
  - `mileage_pay` = (travel_miles - 20) * $0.60 (if miles > 20)
  - `company_revenue` = total_amount - tech_pay - mileage_pay - tax_amount
- Stores all payout calculations in payment record
- Updates existing payments with payout calculations

### 5. Payment Sync Route
**File:** `app/api/appointments/[id]/sync-payment/route.ts`

**Changes:**
- Includes payout calculations when syncing payments
- Calculates same structure as webhook handler
- Ensures consistency across payment creation methods

### 6. Booking Flow Updates
**File:** `app/(dashboard)/senior/book-appointment/page.tsx`

**Changes:**
- Calculates estimated tax (7% of subtotal) for display
- Shows tax breakdown in price confirmation
- Stores total price including estimated tax
- Actual tax calculated by Stripe Tax API during payment

**Price Breakdown Display:**
- Base Price
- Member Discount (if applicable)
- Travel Fee
- Subtotal
- Tax (7% NC)
- Total Estimated Cost

### 7. Payment Page Updates
**File:** `app/(dashboard)/senior/my-appointments/[id]/payment/page.tsx`

**Changes:**
- Uses appointment `total_price` (includes tax) instead of calculating from hourly rate
- Ensures payment amount matches appointment total

## Payout Structure

### Specialist Pay
- **Hourly Rate:** $30.00 per hour
- **Travel Reimbursement:** $0.60 per mile (after first 20 miles)
- **Total Specialist Pay:** `tech_pay + mileage_pay`

### Company Revenue
- **Base Service:** Remainder after specialist's $30/hr
- **Travel Fee:** $0.40 per mile (client pays $1.00/mile, specialist gets $0.60)
- **Tax:** All tax collected (7% NC) goes to company
- **Total Company Revenue:** `company_revenue = total_amount - tech_pay - mileage_pay - tax_amount`

### Example Calculation

**Scenario:** 90-minute appointment, 25 miles from HQ, non-member

1. **Base Service:** $95 (first hour) + $45 (30 min) = $140.00
2. **Travel Fee:** (25 - 20) × $1.00 = $5.00
3. **Subtotal:** $140.00 + $5.00 = $145.00
4. **Tax (7%):** $145.00 × 0.07 = $10.15
5. **Total Client Pays:** $155.15

**Payout Breakdown:**
- **Hours Worked:** 1.5 hours
- **Tech Pay:** 1.5 × $30 = $45.00
- **Mileage Pay:** 5 × $0.60 = $3.00
- **Total Specialist Pay:** $48.00
- **Company Revenue:** $155.15 - $45.00 - $3.00 - $10.15 = $97.00

## Tax Configuration

### North Carolina Service Tax
- **State Tax:** 4.75%
- **Cumberland County Tax:** 2.25%
- **Total Tax Rate:** 7%
- **Applies To:** All services, subscriptions, and mileage
- **All tax goes to HITS account** (specialists don't receive any tax portion)

### Stripe Tax Setup
1. Enable Stripe Tax in Stripe Dashboard
2. Configure for North Carolina
3. Set up Cumberland County tax rate
4. Tax is automatically calculated and collected

## Payment Flow

1. **Client Books Appointment:**
   - System calculates base price, travel fee, and estimated tax
   - Displays total with tax breakdown

2. **Payment Intent Creation:**
   - Stripe Tax API calculates actual tax based on shipping address
   - Payment intent includes tax in total amount
   - All money goes to HITS main account

3. **Payment Success (Webhook):**
   - Calculates payout structure
   - Stores hours_worked, mileage, tech_pay, mileage_pay, company_revenue, tax_amount
   - Updates appointment status to "confirmed"

4. **Specialist Payout:**
   - Specialists receive payouts manually or on schedule
   - Payout amount = tech_pay + mileage_pay
   - Tracked in `payments` table for reporting

## Important Notes

### No Automatic Payouts
- **All payments go to HITS main Stripe account only**
- No destination charges or connected accounts
- No automatic transfers to specialists
- Specialists receive payouts manually or on a scheduled basis

### Data Tracking
All payout calculations are stored in the `payments` table:
- `hours_worked` - For reporting and verification
- `mileage` - Travel distance for reimbursement
- `tech_pay` - Specialist hourly compensation
- `mileage_pay` - Specialist travel reimbursement
- `company_revenue` - Company profit after all payouts
- `tax_amount` - Tax collected (goes to company)

### Reporting
Use the `payments` table to generate reports:
- Total specialist payouts by period
- Company revenue by period
- Tax collected
- Average payout per appointment
- Mileage reimbursement totals

## Testing Checklist

- [ ] Run database migration (`PAYOUT_STRUCTURE_UPDATE.sql`)
- [ ] Enable Stripe Tax in Stripe Dashboard
- [ ] Test appointment booking with tax calculation
- [ ] Verify payment webhook calculates payouts correctly
- [ ] Check payment records include all payout fields
- [ ] Verify tax is calculated correctly (7% NC)
- [ ] Test with in-person appointments (travel fee)
- [ ] Test with remote appointments (no travel fee)
- [ ] Verify member discounts work with tax
- [ ] Check payment sync route includes payout calculations

## Environment Variables

No new environment variables required. Uses existing:
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

## Future Enhancements

1. **Automated Payouts:** Schedule automatic payouts to specialists (weekly/monthly)
2. **Payout Dashboard:** Admin dashboard to view and manage specialist payouts
3. **Payout History:** Specialist dashboard showing payout history
4. **Tax Reporting:** Generate tax reports for accounting
5. **Revenue Analytics:** Dashboard showing company revenue trends

