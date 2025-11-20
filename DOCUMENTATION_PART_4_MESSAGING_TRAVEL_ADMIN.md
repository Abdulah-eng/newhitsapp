# HITS Platform - Complete Documentation
## Part 4: Messaging, Travel Fees & Admin Dashboard

---

## 7️⃣ Messaging System

### How Messaging Works

**Overview:**
- Internal messaging between clients and specialists
- Tied to appointments (optional)
- Real-time message delivery
- Email notifications for new messages

### Database Structure

**Table:** `messages`

**Key Fields:**
- `sender_id` - User who sent message
- `receiver_id` - User receiving message
- `appointment_id` - Optional link to appointment
- `content` - Message text
- `attachments` - JSONB array of file URLs
- `read_at` - Timestamp when message was read
- `created_at` - Message timestamp

**Indexes:**
- Optimized for conversation queries
- Fast unread message counts
- Efficient sender/receiver lookups

### Message Flow

#### Sending a Message

1. **User Initiates:**
   - Client or specialist clicks "Message" button
   - Opens conversation view
   - Types message and sends

2. **API Processing:**
   - Location: `app/api/messages/send/route.ts`
   - Validates sender and receiver
   - Creates message record in database
   - Triggers email notification

3. **Email Notification:**
   - Location: `lib/email/sendNewMessageEmail.ts`
   - Sends to receiver
   - Includes link to conversation
   - Message body NOT included (security)

#### Receiving Messages

1. **Real-time Updates:**
   - Messages appear in conversation view
   - Unread indicator shows count
   - Badge on messages icon

2. **Reading Messages:**
   - Opening conversation marks messages as read
   - `read_at` timestamp updated
   - Unread count decreases

### Message Features

**Conversation View:**
- Location: `/senior/messages/[userId]` or `/specialist/messages/[userId]`
- Shows message history
- Chronological order
- Sender/receiver clearly marked

**Unread Indicators:**
- Badge on messages icon
- Shows count of unread messages
- Updates in real-time
- Location: `lib/hooks/useUnreadMessageCount.ts`

**Message Threading:**
- Messages linked by sender/receiver pair
- Optional appointment context
- Easy to find conversation history

### Email Notification Triggers

**When Email is Sent:**
- New message received
- Receiver is not currently viewing conversation
- SMTP configured correctly

**Email Content:**
- Subject: "You have a new message on HITS"
- Includes sender name
- Link to view conversation
- Security notice (message body not included)

**Email Template Location:**
- `lib/email/sendNewMessageEmail.ts`
- HTML and plain text versions
- Inline CSS styling

### Message Access Control

**Who Can Message Whom:**
- Clients can message their specialists
- Specialists can message their clients
- Admins can message anyone
- Users cannot message themselves

**Appointment Context:**
- Messages can be linked to appointments
- Helps organize conversations
- Optional field (can be null)

---

## 8️⃣ Travel Fee & Distance Calculation Logic

### Headquarters Location

**Address:** Hope Mills, NC 28348
**Coordinates:** `34.892007,-78.880128` (Latitude, Longitude)

**Location in Code:**
- File: `app/api/travel/calculate/route.ts`
- Line 28: `const origin = "34.892007,-78.880128";`

### Distance Calculation

#### API Used

**Google Maps Distance Matrix API**
- Service: Server-side distance calculation
- Endpoint: `https://maps.googleapis.com/maps/api/distancematrix/json`
- Method: HTTP GET request
- Returns: Distance in meters, converted to miles

#### Calculation Process

1. **Client Provides Address:**
   - Street address
   - City
   - State
   - ZIP code

2. **API Call:**
   - Location: `app/api/travel/calculate/route.ts`
   - Origin: HITS HQ coordinates
   - Destination: Client address (formatted)
   - Mode: Driving
   - Units: Imperial (miles)

3. **Distance Extraction:**
   - API returns distance in meters
   - Converted to miles: `meters × 0.000621371`
   - Rounded to 2 decimal places

4. **Fee Calculation:**
   - Location: `lib/utils/travel.ts`
   - Function: `calculateTravelFee()`
   - Logic: First 20 miles free, then $1.00/mile

### Travel Fee Structure

#### Pricing Rules

**Included Miles:**
- First 20 miles: **FREE** (no charge to client)

**Beyond 20 Miles:**
- Client pays: **$1.00 per mile**
- Specialist receives: **$0.60 per mile** (reimbursement)
- Company retains: **$0.40 per mile**

**Round Trip:**
- Distance calculated is one-way
- Fee applies to round trip automatically
- No separate round-trip calculation needed

#### Calculation Example

**Scenario:** Client 25 miles from HQ

1. **Distance:** 25 miles
2. **Included:** 20 miles (free)
3. **Extra Miles:** 25 - 20 = 5 miles
4. **Client Fee:** 5 × $1.00 = **$5.00**
5. **Specialist Reimbursement:** 5 × $0.60 = **$3.00**
6. **Company Retention:** 5 × $0.40 = **$2.00**

### Code Locations

#### Travel Calculation API

**File:** `app/api/travel/calculate/route.ts`

**Key Functions:**
- `POST` handler - Main calculation endpoint
- Formats destination address
- Calls Google Maps API
- Calculates fees and reimbursements
- Returns JSON response

#### Travel Utility Functions

**File:** `lib/utils/travel.ts`

**Functions:**
- `calculateTravelFee()` - Client fee calculation
- `calculateSpecialistReimbursement()` - Specialist payout
- `calculateCompanyRetention()` - Company portion
- `calculateBasePrice()` - Service fee calculation
- `calculateTotalPrice()` - Total with travel fee

**Configuration:**
```typescript
export const TRAVEL_CONFIG = {
  includedMiles: 20,
  clientRatePerMile: 1.00,
  specialistReimbursementPerMile: 0.60,
};
```

### Updating Travel Pricing

#### Change Included Miles

**Location:** `lib/utils/travel.ts`

**Update:**
```typescript
export const TRAVEL_CONFIG = {
  includedMiles: 25, // Change from 20 to 25
  // ... rest of config
};
```

#### Change Per-Mile Rate

**Location:** `lib/utils/travel.ts`

**Update:**
```typescript
export const TRAVEL_CONFIG = {
  includedMiles: 20,
  clientRatePerMile: 1.50, // Change from 1.00 to 1.50
  specialistReimbursementPerMile: 0.90, // Adjust proportionally
  // ... rest of config
};
```

**Also Update:**
- `app/api/travel/calculate/route.ts` - Hardcoded values in API
- Documentation (this file)
- Any pricing displays in UI

### Google Maps API Configuration

#### API Keys Required

**Backend Key:**
- Environment variable: `GOOGLE_MAPS_BACKEND_KEY`
- Used for: Distance Matrix API calls
- Restrictions: Should be restricted to Distance Matrix API only
- Never exposed to client

**Frontend Key (Optional):**
- Environment variable: `NEXT_PUBLIC_GOOGLE_MAPS_FRONTEND_KEY`
- Used for: Client-side map displays
- Can be restricted by HTTP referrer

#### API Setup

1. **Google Cloud Console:**
   - Enable Distance Matrix API
   - Create API key
   - Restrict to Distance Matrix API
   - Add to environment variables

2. **Billing:**
   - Google Maps API requires billing account
   - Distance Matrix API pricing: Check Google's current rates
   - Monitor usage in Google Cloud Console

---

## 9️⃣ Admin Dashboard Functions

### Dashboard Overview

**Location:** `/admin/dashboard`

**Key Metrics Displayed:**
- Total users (all roles)
- Number of seniors
- Number of disabled adult clients
- Number of specialists
- Pending specialist verifications
- Total appointments
- Appointments today
- Total revenue
- Net revenue
- Open disputes

**Data Sources:**
- `users` table - User counts
- `senior_profiles` table - Disabled adult count
- `appointments` table - Appointment counts
- `payments` table - Revenue calculations
- `disputes` table - Open dispute count
- `specialist_profiles` table - Pending verifications

### User Management

**Location:** `/admin/users`

**Features:**
- List all users with filters
- Search by name, email, role
- Filter by role (senior, specialist, admin)
- View user details
- Edit user information
- Activate/deactivate accounts
- View user activity

**User Actions:**
- **View Profile:** See full user details
- **Edit User:** Update name, email, role
- **Deactivate:** Disable user account
- **Activate:** Re-enable user account
- **View Appointments:** See user's appointment history
- **View Payments:** See user's payment history

**Data Source:**
- `users` table
- `senior_profiles` table (for seniors)
- `specialist_profiles` table (for specialists)

### Appointments Management

**Location:** `/admin/appointments`

**Features:**
- List all appointments
- Filter by status (pending, confirmed, completed, cancelled)
- Search by client or specialist name
- View appointment details
- See travel distance and fees
- View issue descriptions
- Filter by date range

**Appointment Details Include:**
- Client information
- Specialist information
- Scheduled date/time
- Duration
- Location (address or remote)
- Issue description
- Status
- Travel distance (if in-person)
- Travel fee
- Payment status

**Data Source:**
- `appointments` table
- Joined with `users` table (for names)
- Joined with `payments` table (for payment info)

### Payments Management

**Location:** `/admin/payments`

**Features:**
- List all payment transactions
- Filter by status (pending, completed, refunded, failed)
- Search by client, specialist, or amount
- View payment breakdown:
  - Base amount
  - Travel fee
  - Membership discount
  - Total amount
- View Stripe transaction IDs
- Export payment data

**Payment Details:**
- Client name and email
- Specialist name
- Appointment reference
- Amount breakdown
- Payment status
- Stripe payment ID
- Timestamps (created, updated)
- Refund information (if applicable)

**Data Source:**
- `payments` table
- Joined with `users` table
- Joined with `appointments` table

### Dispute Resolution

**Location:** `/admin/disputes`

**Features:**
- List all disputes
- Filter by status (open, resolved, dismissed)
- Filter by type (review, cancellation, payment, service, other)
- Search by client or specialist name
- View dispute details
- Resolve disputes
- Add resolution notes
- Issue refunds or credits

**Dispute Types:**
- **Review:** Low rating review disputes
- **Cancellation:** Appointment cancellation issues
- **Payment:** Payment or refund issues
- **Service:** Service quality complaints
- **Other:** Miscellaneous issues

**Dispute Details Include:**
- Client information
- Specialist information (if applicable)
- Appointment details (if applicable)
- Review details (if applicable)
- Payment details (if applicable)
- Dispute reason
- Description
- Resolution summary
- Admin notes
- Refund/credit amounts

**Resolution Actions:**
- Mark as resolved
- Mark as dismissed
- Add resolution summary
- Add internal notes
- Process refund (via Stripe)
- Issue credit

**Data Source:**
- `disputes` table
- Joined with multiple tables (users, appointments, reviews, payments)

### Resource Management

**Location:** `/admin/resources`

**Features:**
- List all resources
- Upload new resources
- Edit resource details
- Delete resources
- Set access level (free or members only)
- Categorize resources
- View download counts

**Resource Upload:**
- Files stored in Supabase Storage
- Bucket: `resources`
- Public access for free resources
- Access-controlled for member-only resources

**Resource Fields:**
- Title
- Description
- Category
- Access level (free/members only)
- File URL
- File name and size
- Download count
- Active status

**Data Source:**
- `resources` table
- Supabase Storage bucket: `resources`

### Membership Management

**Location:** `/admin/memberships`

**Features:**
- List all memberships
- Filter by status (pending, active, cancelled, expired)
- View membership details
- See subscription information
- View billing history
- Manage membership status

**Membership Details:**
- User information
- Plan details
- Status
- Start date
- Next billing date
- Cancellation date (if applicable)
- Stripe subscription ID
- Payment history

**Data Source:**
- `user_memberships` table
- Joined with `users` table
- Joined with `membership_plans` table

### Contact Messages

**Location:** `/admin/contact-messages`

**Features:**
- View contact form submissions
- Filter by status (new, read, replied, archived)
- Mark as read/replied
- Add admin notes
- Archive messages

**Message Details:**
- Sender name, email, phone
- Subject
- Message content
- Submission date
- Status
- Admin notes

**Data Source:**
- `contact_messages` table

### Security & Monitoring

**Location:** `/admin/security`

**Features:**
- View security events
- Monitor suspicious activity
- View login attempts
- Review access logs
- Security alerts

**Data Source:**
- `activity_logs` table
- Filtered by security-related events

### Activity Logs

**Location:** `/admin/logs`

**Features:**
- View all system activity
- Filter by activity type
- Filter by user
- Search logs
- View detailed metadata
- Export logs

**Activity Types:**
- User actions
- Payment events
- Appointment events
- Dispute events
- Membership events
- Admin actions

**Data Source:**
- `activity_logs` table

### Platform Settings

**Location:** `/admin/settings`

**Features:**
- Update platform configuration
- Change pricing settings
- Update contact information
- Manage feature flags
- Configure notifications
- Update platform fee percentage

**Settings Stored In:**
- `platform_settings` table
- Key-value pairs with JSONB values

---

## Next Steps

See `DOCUMENTATION_PART_5_FRONTEND_AND_FEATURES.md` for:
- Frontend pages and standards
- Resource upload system
- HITS chatbot behavior
- Legal and compliance pages

