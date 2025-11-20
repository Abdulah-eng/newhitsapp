# HITS Platform - Complete Documentation
## Part 5: Frontend, Chatbot, Resources & Transfer of Ownership

---

## 🔟 Frontend Pages & Required Standards

### Global Requirements

#### Consistent Header

**Location:** `components/MarketingHeader.tsx` (public pages) and `components/DashboardHeader.tsx` (dashboard pages)

**Requirements:**
- Consistent across all pages
- Logo/branding visible
- Navigation menu
- User account menu (when logged in)
- Responsive design (mobile-friendly)

**Header Elements:**
- HITS logo
- Main navigation links
- "Book a Visit" CTA button
- User menu (if authenticated)
- Mobile hamburger menu

#### Consistent Footer

**Location:** `app/(public)/layout.tsx`

**Requirements:**
- Consistent across all public pages
- Contact information
- Legal links (Privacy, Terms)
- Social media links (if applicable)
- Copyright notice

**Footer Elements:**
- Company information
- Contact details (email, phone)
- Quick links
- Legal pages links
- Copyright year

#### Accessibility Standards

**Font Size:**
- Minimum 16px for body text
- Larger fonts for headings
- Readable on all devices

**Color Contrast:**
- WCAG AA compliant
- High contrast for text
- Clear distinction between interactive elements

**Senior-Friendly UX:**
- Large clickable areas
- Clear labels and instructions
- Simple navigation
- Minimal jargon
- Helpful tooltips where needed

### Page-Specific Behaviors

#### Home Page (`/`)

**Location:** `app/page.tsx`

**Features:**
- Hero section with main CTA
- Service highlights
- How it works section
- Testimonials/reviews
- Pricing overview
- Call-to-action buttons

**Responsiveness:**
- Mobile-first design
- Images scale appropriately
- Text remains readable
- Buttons easily tappable

#### Pricing Page (`/plans`)

**Location:** `app/plans/page.tsx`

**Features:**
- Membership plan comparison
- Pay-as-you-go pricing
- Clear pricing breakdown
- Sign-up CTAs
- FAQ section

**Content:**
- Connect Plan: $25/month
- Comfort Plan: $59/month
- Family Care+ Plan: $99/month
- Pay-as-you-go: $90/hour + $45 per 30 min

#### About Page (`/about`)

**Location:** `app/about/page.tsx`

**Features:**
- Company mission
- Team information
- Service area
- Values and principles

**Content Updates:**
- Edit directly in `app/about/page.tsx`
- Update text content as needed
- Maintain consistent styling

#### Contact/Support (`/contact`)

**Location:** `app/(public)/contact/page.tsx`

**Features:**
- Contact form
- Support email: support@hitsapp.com
- Support phone: (646) 758-6606
- Business hours: Monday-Friday, 9am-5pm EST

**Form Submission:**
- Stored in `contact_messages` table
- Admin can view in `/admin/contact-messages`
- Email notification (if configured)

#### Resource Download Pages (`/resources`)

**Location:** `app/(public)/resources/page.tsx`

**Features:**
- List of downloadable resources
- Filter by category
- Access level indicators (free/members only)
- Download buttons
- Resource descriptions

**Access Control:**
- Free resources: Available to all
- Members-only: Requires active membership
- Login required for member resources

### Design Decisions

#### Watermarked Images

**Status:** Currently using placeholder images

**Location:** `public/images/`

**Replacement Process:**
1. Obtain final images without watermarks
2. Replace files in `public/images/`
3. Maintain same file names OR update references
4. Optimize images for web (compression, format)

**Image Files:**
- `account-recovery.webp`
- `app-training.jpg`
- `care-giver.jpg`
- `device-setup.jpg`
- `disabled-adults.jpg`
- `first.webp`
- `second.png`
- `third.jpg`
- `fourth.jpg`
- `fifth.jpg`
- `sixth.jpg`
- `seniors.jpg`
- `telehealth.webp`
- `video-call.avif`
- `wifi.jpg`

#### Temporary Removals

**"In The News" Section:**
- Currently not implemented
- Can be added when news content is available
- Location: Can be added to home page or separate `/news` page

**Unused Features:**
- Review codebase for unused components
- Remove or comment out as needed
- Keep for future use if planned

---

## 1️⃣1️⃣ Resource Upload System

### Storage Location

**Provider:** Supabase Storage

**Bucket Name:** `resources`

**Bucket Type:** Public (for free resources)

**Configuration:**
- File: `CREATE_RESOURCES_BUCKET.sql`
- Run in Supabase SQL Editor to set up bucket

### Access Control

#### Who Can Upload

**Admin Only:**
- Only admins can upload resources
- Access via `/admin/resources`
- Requires admin role authentication

#### Who Can Access

**Free Resources:**
- Available to all users (public)
- No login required
- Direct download links

**Members-Only Resources:**
- Requires active membership
- Login required
- Access checked via membership status

### Allowed Formats & Size Limits

**File Formats:**
- PDF documents (recommended)
- Images (JPG, PNG, WebP)
- Documents (DOC, DOCX)
- Spreadsheets (XLS, XLSX)
- Other common formats

**Size Limits:**
- Supabase Storage default: Check Supabase plan limits
- Recommended: Keep files under 10MB
- Large files may timeout on upload

**Current Implementation:**
- No hard size limit in code
- Relies on Supabase Storage limits
- Can add client-side validation if needed

### Upload Process

#### Via Admin Panel

1. **Navigate to Resources:**
   - Go to `/admin/resources`
   - Click "Upload New Resource"

2. **Fill Form:**
   - Title
   - Description
   - Category
   - Access level (free or members only)
   - Select file(s)

3. **Upload:**
   - File uploaded to Supabase Storage
   - Record created in `resources` table
   - File URL stored in database

#### Code Location

**File:** `app/(dashboard)/admin/resources/page.tsx`

**Key Functions:**
- `handleSubmit()` - Upload handler
- `handleFileChange()` - File selection
- Supabase Storage upload
- Database record creation

### Managing Resources

#### Edit Resource

**Via Admin Panel:**
1. Go to `/admin/resources`
2. Find resource to edit
3. Click "Edit"
4. Update details
5. Save changes

**Fields Editable:**
- Title
- Description
- Category
- Access level
- Active status

#### Delete Resource

**Via Admin Panel:**
1. Go to `/admin/resources`
2. Find resource to delete
3. Click "Delete"
4. Confirm deletion

**What Gets Deleted:**
- Database record
- File in Supabase Storage (if configured)
- Download links become invalid

#### Replace Resource

**Process:**
1. Delete old resource
2. Upload new resource with same title
3. Or edit existing resource and upload new file

**Note:** Current implementation may require delete + re-upload

### Database Structure

**Table:** `resources`

**Key Fields:**
- `id` - Resource identifier
- `title` - Resource title
- `description` - Resource description
- `file_url` - Supabase Storage URL
- `file_name` - Original file name
- `file_size` - File size in bytes
- `file_type` - MIME type
- `category` - Resource category
- `access_level` - 'free' or 'members_only'
- `download_count` - Number of downloads
- `is_active` - Whether resource is available
- `created_at` - Upload timestamp

---

## 1️⃣2️⃣ HITS Chatbot Behavior

### Technology Used

**AI Provider:** Google Generative AI (Gemini)

**Model:** `models/gemini-2.5-flash`

**API Key:**
- Currently hardcoded in `lib/gemini/client.ts`
- **IMPORTANT:** Move to environment variable for production
- Environment variable: `GEMINI_API_KEY`

**Code Location:**
- Client: `lib/gemini/client.ts`
- Chat logic: `lib/gemini/chat.ts`
- API endpoint: `app/api/gemini/chat/route.ts`

### Brand Customizations

#### System Prompt

**Location:** `lib/gemini/chat.ts`

**Key Branding Elements:**
- Company name: "HITS – Hire I.T. Specialist"
- Positioning: Virtual assistant for seniors
- Tone: Simple, friendly, patient
- Language: Plain language, minimal jargon

#### Customizations Required

**Update in `lib/gemini/chat.ts`:**
- Support email: `support@hitsapp.com`
- Support phone: `(646) 758-6606`
- Service area: Hope Mills, NC
- Pricing: Update if changed
- Membership plans: Update if changed

### Usage Limitations

#### Free Tier

**Google Gemini 2.5 Flash:**
- Free tier with generous rate limits
- Monitor usage in Google Cloud Console
- Upgrade to paid tier if needed

#### Rate Limiting

**Current Implementation:**
- No rate limiting in code
- Relies on Google's API limits
- Can add rate limiting if needed

**Monitoring:**
- Check Google Cloud Console
- Monitor API usage
- Set up alerts for high usage

### Scope of Answers

#### What Chatbot Can Answer

**HITS-Specific Topics:**
- HITS services and offerings
- Pricing and membership plans
- How to book appointments
- Travel area and fees
- Service types available
- Contact information

#### What Chatbot Cannot Answer

**Restricted Topics:**
- General tech advice (beyond HITS scope)
- Medical, legal, or financial advice
- Emergency help
- Services from other companies
- Unrelated topics

**Response for Restricted Topics:**
- Redirects to support contact
- Message: "I'm here to help with questions about HITS services. For that topic, please contact support@hitsapp.com or (646) 758-6606."

### Emergency Handling

**Emergency Keywords Detected:**
- "scam", "fraud", "hacked", "stolen"
- "emergency", "urgent", "danger"
- "victim", "criminal"

**Response:**
- Immediate redirect to emergency contacts
- Message: "HITS Assistant can't handle emergencies. If you think you're a victim of fraud or in any danger, please contact your bank and local law enforcement right away. After you're safe, our team can help you secure your devices and accounts. You can reach support at support@hitsapp.com or call (646) 758-6606."

### UI Placement

**Component:** `components/ClientChatbotWrapper.tsx`

**Placement:**
- Appears on public pages
- Floating chat button (bottom right)
- Opens chat interface overlay
- Mobile-responsive

**Visibility:**
- Public pages: Visible
- Dashboard pages: May be hidden (check implementation)
- Can be toggled via settings

### Updating Chatbot Behavior

#### Change System Prompt

**File:** `lib/gemini/chat.ts`

**Function:** `chatWithAI()`

**Update:**
- System prompt text
- Branding information
- Service descriptions
- Pricing information

#### Add Common Questions

**File:** `lib/gemini/chat.ts`

**Function:** `generateAutomatedResponse()`

**Add to `commonQuestions` object:**
```typescript
"new question": "Answer text here",
```

---

## 1️⃣3️⃣ Legal & Compliance Pages

### Privacy Policy

**Location:** `app/(public)/privacy/page.tsx`

**Content Storage:**
- Stored in React component file
- Edit directly in `app/(public)/privacy/page.tsx`
- HTML/JSX format

**Updating Content:**
1. Open `app/(public)/privacy/page.tsx`
2. Edit text content
3. Maintain styling
4. Save and deploy

**Contact Details in Policy:**
- Update email: `support@hitsapp.com`
- Update phone: `(646) 758-6606`
- Update address if needed

### Terms of Service

**Location:** `app/(public)/terms/page.tsx`

**Content Storage:**
- Stored in React component file
- Edit directly in `app/(public)/terms/page.tsx`
- HTML/JSX format

**Updating Content:**
1. Open `app/(public)/terms/page.tsx`
2. Edit text content
3. Maintain styling
4. Save and deploy

**Contact Details in Terms:**
- Update email: `support@hitsapp.com`
- Update phone: `(646) 758-6606`
- Update company information if needed

### Other Legal Pages

**Safety Page:**
- Location: `app/(public)/safety/page.tsx`
- Safety information and guidelines

**FAQ Page:**
- Location: `app/(public)/faq/page.tsx`
- Frequently asked questions

**Updating Process:**
- Same as Privacy and Terms
- Edit component files directly
- Maintain consistent styling

---

## 1️⃣4️⃣ Transfer of Ownership Requirements

### What Owner Will Control

#### 1. Vercel Account

**Current Status:**
- Project hosted on developer's Vercel account
- Domain connected to Vercel

**Transfer Steps:**
1. **Add Owner as Team Member:**
   - Go to Vercel Project Settings → Team
   - Add owner's email as team member
   - Grant admin/owner permissions

2. **Transfer Project Ownership:**
   - Go to Project Settings → General
   - Transfer project to owner's Vercel account
   - Owner accepts transfer

3. **Owner Actions After Transfer:**
   - Owner has full control
   - Can manage deployments
   - Can update environment variables
   - Can manage domain

**Verification:**
- Owner can log into Vercel
- Owner sees project in their dashboard
- Owner can deploy and manage settings

#### 2. Domain

**Current Status:**
- Domain connected to Vercel
- DNS managed by domain registrar

**Transfer Steps:**
1. **Domain Registrar Access:**
   - Owner needs access to domain registrar account
   - Update DNS records if needed
   - Transfer domain to owner's account (if applicable)

2. **Vercel Domain Settings:**
   - After Vercel transfer, domain remains connected
   - Owner can manage domain in Vercel
   - Owner can update DNS if needed

**Verification:**
- Domain resolves correctly
- SSL certificate active
- Owner can update DNS records

#### 3. Stripe Account

**Current Status:**
- Using developer's Stripe credentials
- Webhooks configured

**Transfer Steps:**
1. **Create Owner's Stripe Account:**
   - Owner creates Stripe account
   - Owner gets API keys

2. **Update Environment Variables:**
   - Go to Vercel → Project Settings → Environment Variables
   - Update:
     - `STRIPE_SECRET_KEY` → Owner's secret key
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Owner's publishable key
     - `STRIPE_WEBHOOK_SECRET` → Owner's webhook secret

3. **Configure Webhooks:**
   - Owner goes to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events (see Part 3 documentation)
   - Copy webhook secret to environment variables

4. **Migrate Customers (Optional):**
   - Export customer data from old Stripe account
   - Import to new Stripe account (if needed)
   - Update `stripe_customer_id` in database (if migrating)

**Verification:**
- Test payment succeeds
- Webhooks received correctly
- Payments appear in owner's Stripe dashboard

#### 4. Database (Supabase)

**Current Status:**
- Database on developer's Supabase account
- Owner will be added as collaborator

**Transfer Steps:**
1. **Add Owner as Collaborator:**
   - Go to Supabase Dashboard → Project Settings → Team
   - Add owner's email as team member
   - Grant owner/admin permissions

2. **Transfer Project (Optional):**
   - Can transfer entire project to owner's account
   - Or keep as collaborator (owner has full access)

3. **Update Environment Variables:**
   - Owner gets Supabase credentials
   - Update in Vercel if project transferred:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

**Verification:**
- Owner can log into Supabase
- Owner can access database
- Owner can view/edit data
- Application still connects correctly

#### 5. Admin Accounts

**Current Status:**
- Admin accounts in database
- Access via email/password

**Transfer Steps:**
1. **Create Owner Admin Account:**
   - Owner registers account
   - Admin updates user role to 'admin' in database:
     ```sql
     UPDATE users 
     SET role = 'admin' 
     WHERE email = 'owner@email.com';
     ```

2. **Change Passwords:**
   - Owner can change password via "Forgot Password"
   - Or admin can reset password in Supabase Auth

3. **Remove Developer Admin (Optional):**
   - Can deactivate developer admin account
   - Or keep for support (owner's choice)

**Verification:**
- Owner can log in as admin
- Owner has full admin access
- Owner can manage all features

### How to Change Passwords

#### User Password (Any User)

**Via UI:**
1. Go to login page
2. Click "Forgot Password"
3. Enter email
4. Check email for reset link
5. Follow link and set new password

**Via Supabase Dashboard:**
1. Go to Authentication → Users
2. Find user
3. Click "..." menu
4. Select "Reset Password"
5. User receives reset email

#### Admin Password

**Same as above** - Admin is just a user with `role = 'admin'`

### Modifying API Keys

#### Stripe Keys

**Location:** Vercel Environment Variables

**Steps:**
1. Go to Vercel → Project Settings → Environment Variables
2. Find Stripe variables
3. Click "Edit"
4. Update value
5. Save
6. Redeploy project

**Variables to Update:**
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### Google Maps Keys

**Location:** Vercel Environment Variables

**Steps:**
1. Go to Vercel → Project Settings → Environment Variables
2. Find Google Maps variables
3. Update values
4. Redeploy

**Variables:**
- `GOOGLE_MAPS_BACKEND_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_FRONTEND_KEY`

#### Gemini AI Key

**Location:** 
- Currently hardcoded in `lib/gemini/client.ts`
- **Should be moved to environment variable**

**Steps:**
1. Add `GEMINI_API_KEY` to Vercel environment variables
2. Update `lib/gemini/client.ts` to use environment variable:
   ```typescript
   const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
   ```
3. Redeploy

#### Supabase Keys

**Location:** Vercel Environment Variables

**Steps:**
1. Go to Vercel → Project Settings → Environment Variables
2. Update Supabase variables
3. Redeploy

**Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Moving to Another Developer

#### Preparation

1. **Document Current Setup:**
   - All environment variables
   - Database schema
   - Third-party service accounts
   - Domain configuration

2. **Grant Access:**
   - Add new developer as collaborator
   - Or transfer ownership

#### Steps for New Developer

1. **Get Access:**
   - Vercel project access
   - Supabase project access
   - Domain access (if managing DNS)
   - Stripe account access (if managing payments)

2. **Clone Repository:**
   - Clone Git repository
   - Install dependencies: `npm install`
   - Set up local environment variables

3. **Understand System:**
   - Read this documentation
   - Review codebase structure
   - Understand database schema

4. **Test Locally:**
   - Run `npm run dev`
   - Test key features
   - Verify database connection

### Confirmation Checklist

**No System Dependencies Locked to Developer:**

✅ **Vercel:**
- Project can be transferred
- Owner has full control
- No developer account dependency

✅ **Domain:**
- Owner controls domain registrar
- DNS can be updated by owner
- No developer dependency

✅ **Stripe:**
- Owner uses own Stripe account
- Owner's API keys in environment variables
- No developer account dependency

✅ **Database:**
- Owner has Supabase access
- Owner can export/backup data
- Can be transferred to owner's account
- No developer account dependency

✅ **Email:**
- Owner uses own SMTP credentials
- Owner's credentials in environment variables
- No developer account dependency

✅ **Admin Accounts:**
- Owner has admin account
- Owner can create/manage admins
- No developer account dependency

✅ **Code:**
- Code in Git repository
- Owner has repository access
- Can be forked/cloned independently
- No developer dependency

### Final Handoff Steps

1. **Share Documentation:**
   - Provide all documentation files
   - Share this complete guide
   - Provide any additional notes

2. **Grant Access:**
   - Vercel project access
   - Supabase project access
   - Repository access
   - Domain access (if applicable)

3. **Update Credentials:**
   - Owner updates all API keys
   - Owner updates SMTP credentials
   - Owner updates Stripe credentials
   - Owner creates admin account

4. **Test Everything:**
   - Test login
   - Test payments
   - Test email notifications
   - Test admin functions
   - Test chatbot

5. **Remove Developer Access (Optional):**
   - Owner removes developer from Vercel
   - Owner removes developer from Supabase
   - Owner changes all passwords
   - Owner revokes developer API keys

---

## Documentation Index

- **Part 1:** `DOCUMENTATION_PART_1_ARCHITECTURE_AND_DEPLOYMENT.md`
- **Part 2:** `DOCUMENTATION_PART_2_DATABASE_AND_ROLES.md`
- **Part 3:** `DOCUMENTATION_PART_3_PAYMENTS_AND_EMAIL.md`
- **Part 4:** `DOCUMENTATION_PART_4_MESSAGING_TRAVEL_ADMIN.md`
- **Part 5:** `DOCUMENTATION_PART_5_FRONTEND_CHATBOT_TRANSFER.md` (this file)

---

## Support & Maintenance

**For Questions:**
- Review relevant documentation section
- Check code comments
- Review database schema
- Check environment variables

**For Issues:**
- Check Vercel deployment logs
- Check Supabase logs
- Review error messages
- Check Stripe webhook logs

**For Updates:**
- Follow deployment guide (Part 1)
- Update environment variables as needed
- Test changes in preview deployment
- Deploy to production

---

**Documentation Complete** ✅

All 14 required sections have been documented across 5 files for easy reference and maintenance.

