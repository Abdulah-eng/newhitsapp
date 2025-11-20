# HITS Platform - Complete Documentation
## Part 2: Database Schema & User Roles

---

## 3️⃣ Database Schema & Access

### Database Provider

**Supabase (PostgreSQL)**
- Cloud-hosted PostgreSQL database
- Managed by Supabase
- Access via Supabase Dashboard or SQL Editor

### Database Access

#### Admin Access Instructions

1. **Via Supabase Dashboard:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Log in with your Supabase account credentials
   - Select your HITS project
   - Navigate to "SQL Editor" for direct database access
   - Navigate to "Table Editor" for GUI-based data browsing

2. **Connection Details:**
   - **Host:** Found in Project Settings → Database
   - **Database:** `postgres`
   - **Port:** `5432`
   - **User:** `postgres` (or custom user)
   - **Password:** Set in Project Settings → Database

3. **Service Role Key:**
   - Located in Project Settings → API
   - Used for server-side operations bypassing RLS
   - **Keep this secret** - never expose to client

#### Exporting Data

**Via Supabase Dashboard:**
1. Go to Table Editor
2. Select table to export
3. Click "Export" button
4. Choose format (CSV, JSON)

**Via SQL:**
```sql
-- Export users table to CSV
COPY (SELECT * FROM users) TO '/tmp/users.csv' WITH CSV HEADER;
```

**Via Supabase CLI:**
```bash
supabase db dump -f backup.sql
```

### Core Database Tables

#### 1. `users` Table
**Purpose:** Core user accounts for all platform users

**Columns:**
- `id` (UUID, Primary Key) - User identifier
- `email` (TEXT, Unique) - User email address
- `role` (ENUM: 'senior', 'specialist', 'admin') - User role
- `full_name` (TEXT) - User's full name
- `phone` (TEXT, Nullable) - Phone number
- `avatar_url` (TEXT, Nullable) - Profile picture URL
- `stripe_customer_id` (TEXT, Nullable) - Stripe customer ID
- `created_at` (TIMESTAMP) - Account creation date
- `updated_at` (TIMESTAMP) - Last update date

**Indexes:**
- `idx_users_email` - Fast email lookups
- `idx_users_role` - Fast role-based queries
- `idx_users_stripe_customer_id` - Payment lookups

#### 2. `senior_profiles` Table
**Purpose:** Extended profile information for senior clients

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id) - Links to users table
- `address` (TEXT, Nullable) - Street address
- `city` (TEXT, Nullable) - City
- `state` (TEXT, Nullable) - State
- `zip_code` (TEXT, Nullable) - ZIP code
- `preferred_contact_method` (TEXT) - Default: 'email'
- `accessibility_needs` (JSONB) - Accessibility requirements
- `emergency_contact_name` (TEXT, Nullable)
- `emergency_contact_phone` (TEXT, Nullable)
- `notes` (TEXT, Nullable) - Internal notes
- `membership_id` (UUID, Nullable) - Active membership reference
- `is_disabled_adult` (BOOLEAN) - Flag for disabled adult clients
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3. `specialist_profiles` Table
**Purpose:** Specialist professional profiles

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `bio` (TEXT, Nullable) - Professional biography
- `specialties` (TEXT[]) - Array of specialty areas
- `certifications` (JSONB) - Certification details
- `hourly_rate` (NUMERIC) - Base hourly rate
- `service_areas` (TEXT[]) - Service area locations
- `verification_status` (ENUM: 'pending', 'verified', 'rejected')
- `rating_average` (NUMERIC) - Average rating (0-5)
- `total_reviews` (INTEGER) - Number of reviews
- `total_appointments` (INTEGER) - Completed appointments
- `years_experience` (INTEGER, Nullable)
- `languages_spoken` (TEXT[]) - Languages
- `background_check_date` (DATE, Nullable)
- `insurance_verified` (BOOLEAN) - Insurance status
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 4. `appointments` Table
**Purpose:** Booking and appointment records

**Columns:**
- `id` (UUID, Primary Key)
- `senior_id` (UUID, Foreign Key → users.id)
- `specialist_id` (UUID, Foreign Key → users.id)
- `scheduled_at` (TIMESTAMP) - Appointment date/time
- `duration_minutes` (INTEGER) - Duration (default: 60)
- `status` (ENUM: 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled')
- `issue_description` (TEXT) - Client's issue description
- `location_type` (ENUM: 'remote', 'in-person')
- `address` (TEXT, Nullable) - For in-person appointments
- `city` (TEXT, Nullable)
- `state` (TEXT, Nullable)
- `zip_code` (TEXT, Nullable)
- `meeting_link` (TEXT, Nullable) - For remote appointments
- `notes` (TEXT, Nullable) - Internal notes
- `cancelled_at` (TIMESTAMP, Nullable)
- `cancellation_reason` (TEXT, Nullable)
- `completed_at` (TIMESTAMP, Nullable)
- `distance_miles` (NUMERIC, Nullable) - Travel distance
- `travel_fee` (NUMERIC, Nullable) - Calculated travel fee
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 5. `payments` Table
**Purpose:** Payment transaction records

**Columns:**
- `id` (UUID, Primary Key)
- `appointment_id` (UUID, Foreign Key → appointments.id)
- `senior_id` (UUID, Foreign Key → users.id)
- `specialist_id` (UUID, Foreign Key → users.id)
- `amount` (NUMERIC) - Total payment amount
- `base_amount` (NUMERIC, Nullable) - Base service fee
- `travel_fee` (NUMERIC, Nullable) - Travel fee portion
- `membership_discount` (NUMERIC, Nullable) - Discount applied
- `currency` (TEXT) - Default: 'USD'
- `status` (ENUM: 'pending', 'completed', 'refunded', 'failed')
- `payment_method` (TEXT, Nullable) - Payment method used
- `stripe_payment_id` (TEXT, Unique) - Stripe payment intent ID
- `stripe_customer_id` (TEXT, Nullable) - Stripe customer ID
- `refund_amount` (NUMERIC) - Amount refunded (default: 0)
- `refund_reason` (TEXT, Nullable)
- `refunded_at` (TIMESTAMP, Nullable)
- `failure_reason` (TEXT, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 6. `messages` Table
**Purpose:** Internal messaging between users

**Columns:**
- `id` (UUID, Primary Key)
- `appointment_id` (UUID, Nullable, Foreign Key → appointments.id)
- `sender_id` (UUID, Foreign Key → users.id)
- `receiver_id` (UUID, Foreign Key → users.id)
- `content` (TEXT) - Message content
- `attachments` (JSONB) - Array of file URLs/metadata
- `read_at` (TIMESTAMP, Nullable) - When message was read
- `created_at` (TIMESTAMP)

**Indexes:**
- Optimized for conversation queries
- Fast unread message counts

#### 7. `reviews` Table
**Purpose:** Client reviews and ratings

**Columns:**
- `id` (UUID, Primary Key)
- `appointment_id` (UUID, Unique, Foreign Key → appointments.id)
- `senior_id` (UUID, Foreign Key → users.id)
- `specialist_id` (UUID, Foreign Key → users.id)
- `rating` (INTEGER) - Rating 1-5
- `comment` (TEXT, Nullable) - Review text
- `response_text` (TEXT, Nullable) - Specialist's response
- `response_created_at` (TIMESTAMP, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 8. `disputes` Table
**Purpose:** Dispute resolution records

**Columns:**
- `id` (UUID, Primary Key)
- `type` (ENUM: 'review', 'cancellation', 'payment', 'service', 'other')
- `status` (ENUM: 'open', 'resolved', 'dismissed')
- `senior_id` (UUID, Foreign Key → users.id)
- `specialist_id` (UUID, Nullable, Foreign Key → users.id)
- `appointment_id` (UUID, Nullable, Foreign Key → appointments.id)
- `review_id` (UUID, Nullable, Foreign Key → reviews.id)
- `payment_id` (UUID, Nullable, Foreign Key → payments.id)
- `reason` (TEXT) - Dispute reason
- `description` (TEXT, Nullable) - Detailed description
- `resolution` (TEXT, Nullable) - Resolution summary
- `resolution_notes` (TEXT, Nullable) - Admin notes
- `refund_amount` (NUMERIC) - Refund amount if applicable
- `credit_amount` (NUMERIC) - Credit amount if applicable
- `resolved_by` (UUID, Nullable, Foreign Key → users.id) - Admin who resolved
- `resolved_at` (TIMESTAMP, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 9. `user_memberships` Table
**Purpose:** Subscription membership records

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `membership_plan_id` (UUID, Foreign Key → membership_plans.id)
- `status` (ENUM: 'pending', 'active', 'cancelled', 'expired')
- `stripe_subscription_id` (TEXT, Unique) - Stripe subscription ID
- `stripe_customer_id` (TEXT) - Stripe customer ID
- `next_billing_date` (DATE, Nullable) - Next billing date
- `started_at` (TIMESTAMP) - Membership start date
- `cancelled_at` (TIMESTAMP, Nullable) - Cancellation date
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 10. `membership_plans` Table
**Purpose:** Available membership plan definitions

**Columns:**
- `id` (UUID, Primary Key)
- `name` (TEXT) - Plan name (e.g., "Connect", "Comfort")
- `plan_type` (TEXT) - Plan type identifier
- `monthly_price` (NUMERIC) - Monthly subscription price
- `description` (TEXT, Nullable) - Plan description
- `features` (JSONB) - Array of plan features
- `hourly_rate` (NUMERIC, Nullable) - Member hourly rate
- `is_active` (BOOLEAN) - Whether plan is available
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 11. `resources` Table
**Purpose:** Downloadable resource files

**Columns:**
- `id` (UUID, Primary Key)
- `title` (TEXT) - Resource title
- `description` (TEXT, Nullable) - Resource description
- `file_url` (TEXT) - File storage URL
- `file_name` (TEXT) - Original file name
- `file_size` (INTEGER) - File size in bytes
- `file_type` (TEXT) - MIME type
- `category` (TEXT, Nullable) - Resource category
- `access_level` (ENUM: 'free', 'members_only') - Access restriction
- `download_count` (INTEGER) - Number of downloads
- `is_active` (BOOLEAN) - Whether resource is available
- `created_at` (TIMESTAMP)

#### 12. `activity_logs` Table
**Purpose:** System activity audit trail

**Columns:**
- `id` (UUID, Primary Key)
- `type` (TEXT) - Activity type
- `user_id` (UUID, Nullable, Foreign Key → users.id)
- `description` (TEXT) - Activity description
- `metadata` (JSONB) - Additional activity data
- `ip_address` (INET, Nullable) - User IP address
- `user_agent` (TEXT, Nullable) - Browser user agent
- `created_at` (TIMESTAMP)

#### 13. `contact_messages` Table
**Purpose:** Contact form submissions

**Columns:**
- `id` (UUID, Primary Key)
- `name` (TEXT) - Sender name
- `email` (TEXT) - Sender email
- `phone` (TEXT, Nullable) - Sender phone
- `subject` (TEXT) - Message subject
- `message` (TEXT) - Message content
- `status` (ENUM: 'new', 'read', 'replied', 'archived')
- `admin_notes` (TEXT, Nullable) - Internal notes
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Database Relationships

**Key Relationships:**
- `users` → `senior_profiles` (1:1)
- `users` → `specialist_profiles` (1:1)
- `users` → `appointments` (1:many, as senior or specialist)
- `appointments` → `payments` (1:1)
- `appointments` → `reviews` (1:1)
- `appointments` → `messages` (1:many)
- `users` → `user_memberships` (1:many)
- `membership_plans` → `user_memberships` (1:many)

### Row Level Security (RLS)

**RLS Status:** Enabled on all tables

**Policy Types:**
- Users can view/update their own data
- Specialists can view verified specialist profiles
- Admins have full access via service role
- Public read access for certain resources

**Admin Access:**
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- Service role client created in `lib/supabase/server.ts`

---

## 4️⃣ User Roles & Permissions

### User Role Types

#### 1. Super Admin (`role: 'admin'`)

**Abilities:**
- Full access to all admin dashboard features
- User management (create, edit, deactivate users)
- View all appointments, payments, disputes
- Resolve disputes and issue refunds
- Manage resources and platform settings
- View activity logs and security monitoring
- Verify/reject specialist profiles
- Access all user data regardless of RLS

**Access Points:**
- `/admin/dashboard` - Main admin dashboard
- `/admin/users` - User management
- `/admin/appointments` - All appointments
- `/admin/payments` - Payment history
- `/admin/disputes` - Dispute resolution
- `/admin/memberships` - Membership management
- `/admin/resources` - Resource management
- `/admin/security` - Security monitoring
- `/admin/logs` - Activity logs
- `/admin/settings` - Platform settings

**Identification:**
- `role = 'admin'` in users table
- OR email matches `admin@hitspecialist.com` (legacy check)

#### 2. Specialist (`role: 'specialist'`)

**Abilities:**
- View and manage own appointments
- Update availability schedule
- View earnings and payment history
- Message clients
- Respond to reviews
- Update professional profile
- View assigned appointments only

**Access Points:**
- `/specialist/dashboard` - Specialist dashboard
- `/specialist/appointments` - Own appointments
- `/specialist/calendar` - Availability management
- `/specialist/earnings` - Earnings and payments
- `/specialist/messages` - Messaging
- `/specialist/profile` - Profile management
- `/specialist/reviews` - Reviews received

**Verification Status:**
- `pending` - New specialist, not yet verified
- `verified` - Approved by admin, can receive appointments
- `rejected` - Application rejected

**Profile Requirements:**
- Bio, specialties, certifications
- Background check date
- Insurance verification
- Hourly rate setting

#### 3. Client/Senior (`role: 'senior'`)

**Abilities:**
- Book appointments with specialists
- View own appointments and history
- Make payments
- Message specialists
- Leave reviews after completed appointments
- Manage profile and membership
- Download resources (based on access level)
- Report disputes

**Access Points:**
- `/senior/dashboard` - Client dashboard
- `/senior/book-appointment` - Booking flow
- `/senior/my-appointments` - Appointment history
- `/senior/messages` - Messaging
- `/senior/payments` - Payment history
- `/senior/profile` - Profile management
- `/senior/membership` - Membership management
- `/senior/resources` - Resource downloads

**Profile Information:**
- Address and contact details
- Emergency contact information
- Accessibility needs
- Membership status

### Account Status Management

#### Status Types

**Active Account:**
- User can log in and use platform
- No restrictions on functionality
- Default status for new accounts

**Pending Account:**
- New specialist awaiting verification
- Limited functionality until verified
- Cannot receive appointments

**Deactivated Account:**
- Account disabled by admin
- Cannot log in
- Data retained for historical records
- Can be reactivated by admin

#### Account Activation/Deactivation

**Via Admin Dashboard:**
1. Go to `/admin/users`
2. Find user to manage
3. Click "Manage" or user name
4. Toggle account status
5. Save changes

**Via Database:**
```sql
-- Deactivate user (set role or add deactivated flag)
UPDATE users 
SET role = 'senior', updated_at = NOW()
WHERE id = 'user-uuid-here';

-- Reactivate specialist
UPDATE specialist_profiles
SET verification_status = 'verified'
WHERE user_id = 'user-uuid-here';
```

**Rules:**
- Admins cannot be deactivated via UI (safety measure)
- Deactivated specialists cannot receive new appointments
- Existing appointments remain in system
- Payments and history are preserved

### Permission Matrix

| Action | Admin | Specialist | Senior |
|--------|-------|------------|--------|
| View all users | ✅ | ❌ | ❌ |
| Create users | ✅ | ❌ | ❌ |
| Deactivate users | ✅ | ❌ | ❌ |
| View all appointments | ✅ | Own only | Own only |
| Create appointments | ✅ | ❌ | ✅ |
| Cancel appointments | ✅ | Own only | Own only |
| View all payments | ✅ | Own only | Own only |
| Process refunds | ✅ | ❌ | ❌ |
| Resolve disputes | ✅ | ❌ | Report only |
| Manage resources | ✅ | ❌ | ❌ |
| View activity logs | ✅ | ❌ | ❌ |
| Update platform settings | ✅ | ❌ | ❌ |
| Verify specialists | ✅ | ❌ | ❌ |
| Message users | ✅ | Clients only | Specialists only |
| Leave reviews | ✅ | ❌ | ✅ |
| Manage membership | ✅ | ❌ | Own only |

---

## Next Steps

See `DOCUMENTATION_PART_3_PAYMENTS_AND_EMAIL.md` for:
- Stripe billing and payment flow
- Email and notification system
- Webhook configuration

