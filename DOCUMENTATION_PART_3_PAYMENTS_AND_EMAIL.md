# HITS Platform - Complete Documentation
## Part 3: Stripe Billing & Email System

---

## 5️⃣ Stripe Billing & Payment Flow

### Stripe Integration Type

**Standard Stripe** (Not Stripe Connect)
- Direct payment processing
- All funds go to HITS account
- Manual payout to specialists (if needed)
- No automatic split payments

### Payment Flow Overview

#### Appointment Payment Flow

1. **Client Books Appointment:**
   - Client selects specialist and time
   - System calculates total price:
     - Base service fee ($90/hour + $45 per additional 30 min)
     - Travel fee (if applicable)
     - Membership discount (if applicable)

2. **Payment Intent Creation:**
   - Location: `app/api/stripe/create-payment-intent/route.ts`
   - Creates Stripe Payment Intent
   - Includes metadata:
     - `appointment_id`
     - `user_id`
     - `specialist_id`
   - Returns client secret for frontend

3. **Client Payment:**
   - Frontend uses Stripe Elements
   - Client enters payment details
   - Payment processed by Stripe

4. **Webhook Confirmation:**
   - Stripe sends webhook to `/api/stripe/webhook`
   - Event: `payment_intent.succeeded`
   - System creates payment record in database
   - Updates appointment status

#### Membership Subscription Flow

1. **Client Selects Membership Plan:**
   - Location: `/senior/membership`
   - Plans: Connect ($25/mo), Comfort ($59/mo), Family Care+ ($99/mo)

2. **Subscription Creation:**
   - Location: `app/api/stripe/create-subscription/route.ts`
   - Creates Stripe Subscription
   - Includes metadata:
     - `user_id`
     - `membership_plan_id`
   - Sets up recurring billing

3. **First Payment:**
   - Stripe charges immediately
   - Webhook: `invoice.payment_succeeded`
   - System creates membership record
   - Status set to "active"

4. **Recurring Payments:**
   - Stripe charges monthly
   - Webhook updates membership
   - `next_billing_date` updated

### Payment Structure

#### Service Fee Calculation

**Base Pricing:**
- **First Hour:** $90.00
- **Additional 30 Minutes:** $45.00
- **Member Rate:** Varies by plan (stored in `membership_plans.hourly_rate`)

**Calculation Logic:**
- Location: `lib/utils/travel.ts`
- Function: `calculateBasePrice()`
- Handles member discounts automatically

**Example:**
- 90-minute appointment: $90 + $45 = $135
- Member with $75/hour rate: $75 + $37.50 = $112.50

#### Travel Fee Calculation

**Pricing Structure:**
- **First 20 miles:** Included (no charge)
- **Beyond 20 miles:** $1.00 per mile (round trip)
- **Specialist reimbursement:** $0.60 per mile
- **Company retention:** $0.40 per mile

**Calculation:**
- Location: `app/api/travel/calculate/route.ts`
- Uses Google Maps Distance Matrix API
- Origin: HITS HQ (Hope Mills, NC) - `34.892007,-78.880128`
- Calculates one-way distance, applies to round trip

**Example:**
- 25 miles from HQ: (25 - 20) × $1.00 = $5.00 travel fee
- Specialist gets: 5 × $0.60 = $3.00 reimbursement
- Company keeps: 5 × $0.40 = $2.00

### Stripe Webhooks

#### Webhook Endpoint

**URL:** `https://yourdomain.com/api/stripe/webhook`

**Configuration:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint URL
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Copy webhook signing secret
5. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

#### Webhook Event Handlers

**Location:** `app/api/stripe/webhook/route.ts`

**Handled Events:**

1. **`payment_intent.succeeded`**
   - Creates payment record
   - Updates appointment status
   - Handles membership subscriptions

2. **`payment_intent.payment_failed`**
   - Updates payment status to "failed"
   - Logs failure reason
   - Notifies client (if configured)

3. **`charge.refunded`**
   - Updates payment status to "refunded"
   - Records refund amount
   - Updates appointment if needed

4. **`customer.subscription.updated`**
   - Updates membership status
   - Updates `next_billing_date`
   - Handles status changes (active, cancelled, etc.)

5. **`customer.subscription.deleted`**
   - Sets membership status to "cancelled"
   - Records cancellation date
   - Preserves historical data

6. **`invoice.payment_succeeded`**
   - Activates new memberships
   - Renews existing memberships
   - Updates billing dates

7. **`invoice.payment_failed`**
   - Marks membership as past due
   - Logs payment failure
   - Can trigger retry logic

### Payment Records in Database

#### Payment Status Values

- **`pending`** - Payment initiated, awaiting confirmation
- **`completed`** - Payment successful
- **`refunded`** - Payment refunded (partial or full)
- **`failed`** - Payment failed

#### Payment Fields

- `amount` - Total payment amount
- `base_amount` - Service fee portion
- `travel_fee` - Travel fee portion
- `membership_discount` - Discount applied
- `stripe_payment_id` - Stripe Payment Intent ID
- `stripe_customer_id` - Stripe Customer ID
- `refund_amount` - Amount refunded (if any)

### Admin Payment Management

#### Viewing Payments

**Location:** `/admin/payments`

**Features:**
- List all payments with filters
- Search by client, specialist, or amount
- Filter by status
- View payment details
- Export payment data

**Payment Details Include:**
- Client name and email
- Specialist name
- Appointment details
- Amount breakdown (base, travel, discount)
- Payment status
- Stripe transaction ID
- Timestamps

#### Processing Refunds

**Via Stripe Dashboard:**
1. Go to Stripe Dashboard → Payments
2. Find payment to refund
3. Click "Refund"
4. Enter refund amount
5. Confirm refund

**Via Admin Panel:**
- Refund functionality can be added to admin panel
- Currently, refunds processed via Stripe Dashboard
- System automatically updates via webhook

#### Payment Reports

**Export Options:**
- CSV export from admin panel
- SQL queries for custom reports
- Stripe Dashboard reports

**Key Metrics:**
- Total revenue
- Revenue by period
- Revenue by specialist
- Refund rate
- Average transaction value

### Membership Billing

#### Membership Plans

**Connect Plan:**
- Price: $25/month
- Features: Basic support, resource access
- Member rate: Standard rates apply

**Comfort Plan:**
- Price: $59/month
- Features: Priority scheduling, member rates
- Member rate: Reduced hourly rate

**Family Care+ Plan:**
- Price: $99/month
- Features: Family coverage, premium support
- Member rate: Best rates

#### Billing Cycle

**Start Date:**
- Membership starts immediately upon payment
- `started_at` timestamp recorded

**Renewal:**
- Automatic monthly renewal
- Charged on same day each month
- `next_billing_date` updated after each payment

**Cancellation:**
- Client can cancel anytime
- Access continues until end of billing period
- No prorated refunds (unless manually processed)
- `cancelled_at` timestamp recorded

#### Reinstatement

**Same Billing Cycle:**
- If cancelled and reactivated in same cycle:
  - Original billing date maintained
  - No additional charge
  - Status changes to "active"

**New Billing Cycle:**
- If reactivated after cancellation:
  - New subscription created
  - New billing date set
  - Immediate charge

#### Membership Status Logic

**Status Values:**
- `pending` - Payment processing
- `active` - Membership active, billing current
- `cancelled` - Cancelled by user
- `expired` - Payment failed, access revoked

**Status Transitions:**
- `pending` → `active` (on first payment)
- `active` → `cancelled` (user cancellation)
- `active` → `expired` (payment failure)
- `cancelled` → `active` (reinstatement)
- `expired` → `active` (payment retry success)

---

## 6️⃣ Email & Notification System

### Email Service Configuration

**Service:** Nodemailer (SMTP)

**Configuration Location:**
- File: `lib/email/sendNewMessageEmail.ts`
- Environment variables required:
  ```
  SMTP_HOST=smtp.example.com
  SMTP_PORT=587
  SMTP_USER=your-email@domain.com
  SMTP_PASSWORD=your-password
  SMTP_FROM="HITS Notifications <noreply@hitsapp.com>"
  ```

**SMTP Settings:**
- Port 587 (TLS) or 465 (SSL)
- Authentication required
- Secure connection recommended

### Email Templates

**Template Storage:**
- Templates are inline in code (not separate files)
- HTML and plain text versions included
- Styling via inline CSS

**Current Templates:**

#### 1. New Message Notification
**Location:** `lib/email/sendNewMessageEmail.ts`

**Triggered When:**
- User sends message to another user
- Location: `app/api/messages/send/route.ts`

**Template Features:**
- Personalized greeting
- Sender name
- Link to conversation
- Security notice (message body not included)

**Email Content:**
```html
Subject: You have a new message on HITS
Body: Includes sender name, link to view message, security notice
```

#### 2. Password Reset Email
**Service:** Supabase Auth (not Nodemailer)

**Configuration:**
- Managed in Supabase Dashboard
- Go to Authentication → Email Templates
- Customize template as needed

**Template Variables:**
- `{{ .ConfirmationURL }}` - Reset link
- `{{ .Email }}` - User email
- `{{ .Token }}` - Reset token (if needed)

#### 3. Signup Welcome Email
**Service:** Supabase Auth

**Configuration:**
- Supabase Dashboard → Authentication → Email Templates
- "Confirm signup" template

**Customization:**
- Add HITS branding
- Include welcome message
- Add support contact info

### Email Trigger Events

#### Automatic Emails

1. **New Message:**
   - Trigger: Message sent via `/api/messages/send`
   - Recipient: Message receiver
   - Template: New message notification

2. **Password Reset:**
   - Trigger: User requests password reset
   - Service: Supabase Auth
   - Template: Supabase password reset template

3. **Account Confirmation:**
   - Trigger: New user registration
   - Service: Supabase Auth
   - Template: Supabase confirmation template

#### Manual/Planned Emails

**Booking Confirmation:**
- Currently not implemented
- Can be added to appointment creation flow
- Location: After appointment booking in `app/api/appointments` routes

**Booking Reminder:**
- Currently not implemented
- Can be added via scheduled job
- Should send 24 hours before appointment

**Payment Receipt:**
- Currently not implemented
- Can be added to payment webhook handler
- Location: `app/api/stripe/webhook/route.ts`

### Updating Email Branding

#### SMTP Sender Information

**Update `SMTP_FROM` Environment Variable:**
```
SMTP_FROM="HITS Notifications <noreply@yourdomain.com>"
```

**Update in Code:**
- File: `lib/email/sendNewMessageEmail.ts`
- Function: `getSmtpConfig()`
- Update default "from" address if needed

#### Email Template Customization

**For Nodemailer Templates:**
1. Open `lib/email/sendNewMessageEmail.ts`
2. Find HTML template section
3. Update:
   - Colors (currently `#0c4a6e` for primary)
   - Company name
   - Support email/phone
   - Logo (if adding images)

**For Supabase Templates:**
1. Go to Supabase Dashboard
2. Authentication → Email Templates
3. Select template to edit
4. Update HTML content
5. Save changes

### Notification Settings

**Current Implementation:**
- Email notifications are always sent (when configured)
- No user preference toggles yet
- Can be added to user profiles

**Future Enhancement:**
- Add notification preferences to `senior_profiles` table
- Allow users to opt-out of certain emails
- Admin setting to disable all notifications

### Email Delivery Monitoring

**Check Delivery Status:**
- SMTP provider dashboard (if available)
- Check application logs for errors
- Monitor bounce rates

**Troubleshooting:**
- Verify SMTP credentials
- Check firewall/security settings
- Test connection with SMTP test tool
- Review error logs in Vercel

---

## Next Steps

See `DOCUMENTATION_PART_4_MESSAGING_AND_TRAVEL.md` for:
- Messaging system details
- Travel fee calculation logic
- Admin dashboard functions

