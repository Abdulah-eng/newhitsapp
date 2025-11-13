# HITS Production Implementation Plan

## Overview
This document outlines the implementation plan for aligning the HITS platform with the production specification document.

---

## Phase 1: Database Schema Updates

### 1.1 New Tables to Create

#### **membership_plans**
- Store the three membership tiers (Connect, Comfort, Family Care+)
- Track plan details, pricing, and benefits

#### **user_memberships**
- Track which users have active memberships
- Store subscription details, billing cycle, and status

#### **disputes**
- Formal dispute tracking (separate from derived disputes)
- Link to appointments, reviews, or payments
- Track status, resolution, and admin actions

#### **activity_logs**
- Centralized logging for all platform activities
- Track user actions, system events, and changes

#### **platform_settings**
- Store global platform configuration
- Pricing, travel settings, contact info, feature flags

#### **specialist_payments**
- Track specialist earnings and reimbursements
- Separate from client payments for internal accounting

### 1.2 Tables to Modify

#### **appointments**
- Add: `travel_distance_miles` (NUMERIC)
- Add: `travel_fee` (NUMERIC)
- Add: `base_price` (NUMERIC)
- Add: `member_discount` (NUMERIC)
- Add: `total_price` (NUMERIC)
- Add: `specialist_pay_rate` (NUMERIC) - $30/hour
- Add: `specialist_travel_reimbursement` (NUMERIC) - $0.60/mile

#### **senior_profiles**
- Add: `is_disabled_adult` (BOOLEAN) - Track disabled adult clients
- Add: `membership_id` (UUID) - Reference to active membership

#### **payments**
- Add: `travel_fee` (NUMERIC)
- Add: `membership_discount` (NUMERIC)
- Add: `base_amount` (NUMERIC)

---

## Phase 2: Content & Copy Updates

### 2.1 Public Pages

#### **Home Page** (`app/page.tsx`)
- Update hero section with new headline and subheadline
- Add "How HITS Works" section (4 steps)
- Add "Problems We Solve" section
- Add "Who HITS Is For" section
- Add "Trust & Safety" callout

#### **About Page** (`app/about/page.tsx`)
- Update mission and vision statements
- Add "Meet Our Founder" section (Shawn Thomas)
- Update "How HITS Works" section
- Update "Who We Serve" section

#### **For Seniors & Families Page** (`app/(public)/for-seniors-families/page.tsx` - NEW)
- Create new page with hero section
- Add "What We Help With" section
- Add "How a Visit Works" section
- Add "Senior/Client Account" overview
- Add "Safety, Respect & Accessibility" section

#### **For Partners Page** (`app/(public)/for-partners/page.tsx` - NEW)
- Create new page targeting organizations
- Add program types section
- Add benefits to partners section
- Add platform features for partners
- Add CTAs (Request Partnership Call, Download Overview)

#### **Resources Page** (`app/(public)/resources/page.tsx` - NEW or UPDATE)
- Create/update with resource categories
- Add resource types (PDFs, videos, workshops)
- Add access model (public vs. member-only)

#### **Pricing & Plans Page** (`app/plans/page.tsx`)
- Update with new pricing structure
- Add Pay-As-You-Go section ($90/hour, $45/30min)
- Add three membership tiers with full details
- Add Travel Area & Mileage section
- Update copy to match spec exactly

#### **Contact / Support Page** (`app/(public)/contact/page.tsx` - NEW)
- Create contact form
- Add support email, phone, hours
- Add contact form fields (name, email/phone, role, topic, message)
- Add links to FAQ, Privacy Policy, Terms

#### **FAQ Page** (`app/(public)/faq/page.tsx` - NEW)
- Create FAQ page with key entries:
  - Travel & Service Area
  - Scope of Services
  - Data & Backups
  - Emergencies & Fraud

### 2.2 Navigation Updates

Update main navigation to match spec:
1. Home
2. About
3. For Seniors & Families
4. For Partners
5. Resources
6. Pricing & Plans
7. Contact / Support
8. Log In / Sign Up

---

## Phase 3: Application Features

### 3.1 Travel Distance Calculation

#### **Implementation**
- Integrate Google Maps Distance Matrix API or similar
- Calculate distance from Hope Mills, NC 28348 to client address
- Store distance in `appointments.travel_distance_miles`
- Calculate travel fee: `(distance - 20) * $1.00` (if > 20 miles)
- Calculate specialist reimbursement: `(distance - 20) * $0.60` (if > 20 miles)
- Display distance and fee in booking flow
- Add "View in Maps" link for specialists

#### **Files to Create/Update**
- `lib/utils/travel.ts` - Travel calculation utilities
- `app/api/travel/calculate/route.ts` - API endpoint for distance calculation
- Update booking flow to calculate and display travel fees
- Update appointment detail pages to show distance and map link

### 3.2 Membership System

#### **Implementation**
- Create membership plans in database
- Add membership selection to registration/onboarding
- Track active memberships in `user_memberships`
- Apply member discounts to pricing calculations
- Show membership benefits in dashboard
- Handle membership cancellation and changes

#### **Files to Create/Update**
- `lib/hooks/useMembership.ts` - Membership management hook
- `app/(dashboard)/senior/membership/page.tsx` - Membership management page
- Update pricing calculations to apply member discounts
- Update payment flow to recognize membership benefits

### 3.3 Disabled Adult Tracking

#### **Implementation**
- Add `is_disabled_adult` flag to senior profiles
- Update registration form to include this option
- Add filter in admin dashboard for disabled adult clients
- Include in analytics and reporting

#### **Files to Update**
- Registration form (`app/register/page.tsx`)
- Senior profile update form
- Admin dashboard statistics

### 3.4 Specialist Payment Tracking

#### **Implementation**
- Track specialist hourly pay ($30/hour)
- Track travel reimbursement ($0.60/mile beyond 20)
- Create `specialist_payments` table for earnings tracking
- Add earnings dashboard for specialists
- Add payment history and reports

#### **Files to Create/Update**
- `app/(dashboard)/specialist/earnings/page.tsx` - Earnings dashboard
- Update appointment completion to calculate and record specialist pay
- Add payment tracking to admin panel

### 3.5 Activity Logging

#### **Implementation**
- Create centralized `activity_logs` table
- Log key events: registrations, logins, appointments, payments, disputes, settings changes
- Add logging functions to key operations
- Display logs in admin panel (already partially implemented)

#### **Files to Create/Update**
- `lib/utils/activityLogger.ts` - Centralized logging utility
- Update key operations to log activities
- Enhance admin logs page with new log types

### 3.6 Platform Settings

#### **Implementation**
- Create `platform_settings` table
- Add admin settings page to manage:
  - Platform name and contact info
  - Base pricing and labels
  - Travel configuration (HQ location, included miles, rates)
  - Registration settings
  - Notification settings
- Use settings throughout application

#### **Files to Create/Update**
- `app/(dashboard)/admin/settings/page.tsx` - Update with full settings
- `lib/hooks/usePlatformSettings.ts` - Settings management hook
- Update pricing calculations to use settings

### 3.7 Disputes System

#### **Implementation**
- Create formal `disputes` table
- Allow creation of disputes from appointments, reviews, or payments
- Track dispute status, reason, resolution
- Add dispute management to admin panel
- Link disputes to refunds/credits

#### **Files to Create/Update**
- `app/(dashboard)/admin/disputes/page.tsx` - Enhance with formal disputes
- Add dispute creation flow for users
- Add dispute resolution workflow

---

## Phase 4: HITS Assistant (Chatbot) Updates

### 4.1 Branding Updates

#### **Implementation**
- Rename chatbot to "HITS Assistant" throughout UI
- Update all references from "Chatbot" or "AI Assistant"
- Apply HITS branding (colors, fonts)

#### **Files to Update**
- `components/features/AIChatbot.tsx` - Update name and branding
- All references to chatbot in UI

### 4.2 Functionality Updates

#### **Implementation**
- Update prompts to reflect HITS Assistant identity
- Add capability to answer questions about:
  - Services offered and not offered
  - Pricing, memberships, travel area
  - How visits work
- Provide quick links to key pages
- Collect contact info for follow-up
- Add shortcuts for logged-in users
- Add emergency/fraud disclaimers

#### **Files to Update**
- `lib/gemini/chat.ts` - Update system prompts
- `components/features/AIChatbot.tsx` - Add shortcuts and disclaimers
- Update chatbot responses to match HITS tone

---

## Phase 5: UI/UX Updates

### 5.1 Typography

#### **Implementation**
- Apply Times New Roman font throughout (as specified)
- Ensure high contrast and readability
- Large, readable fonts for accessibility

#### **Files to Update**
- `app/globals.css` - Add Times New Roman font family
- Update Tailwind config if needed

### 5.2 Accessibility

#### **Implementation**
- Ensure all pages meet accessibility guidelines
- High contrast text
- Large click targets
- Clear labels
- Alt text for images
- Keyboard navigation support

### 5.3 Dashboard Enhancements

#### **Senior Dashboard**
- Add membership status card
- Show membership benefits
- Add quick links to HITS Assistant shortcuts

#### **Specialist Dashboard**
- Add earnings summary
- Show travel reimbursement details
- Add mileage tracking

#### **Admin Dashboard**
- Enhance statistics with disabled adult count
- Add membership metrics
- Improve dispute management

---

## Phase 6: Testing & Validation

### 6.1 Functionality Testing
- Test travel distance calculation
- Test membership discount application
- Test specialist payment calculations
- Test dispute workflow
- Test activity logging

### 6.2 Content Review
- Verify all copy matches specification
- Check all links and navigation
- Validate pricing displays correctly
- Review FAQ accuracy

### 6.3 Integration Testing
- Test Google Maps integration
- Test Stripe payment flow with new pricing
- Test membership subscription flow
- Test email notifications

---

## Implementation Priority

### High Priority (MVP)
1. Database schema updates (Phase 1)
2. Travel distance calculation (Phase 3.1)
3. Pricing & Plans page updates (Phase 2.1)
4. Membership system basics (Phase 3.2)
5. HITS Assistant branding (Phase 4.1)

### Medium Priority
1. Content updates for public pages (Phase 2.1)
2. Disabled adult tracking (Phase 3.3)
3. Specialist payment tracking (Phase 3.4)
4. Platform settings (Phase 3.6)

### Lower Priority (Post-MVP)
1. Formal disputes system (Phase 3.7)
2. Activity logging enhancements (Phase 3.5)
3. Resources page content (Phase 2.1)
4. Advanced membership features

---

## Notes

- Some features may already be partially implemented
- Review existing code before creating new implementations
- Maintain backward compatibility where possible
- Test thoroughly before deploying to production
- Consider user migration path for existing data

