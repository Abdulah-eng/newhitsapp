# HITS Platform - Maintenance Guide

This guide provides clear instructions for maintaining and updating the HITS platform. It covers file structure, content updates, deployment, and common maintenance tasks.

---

## 📁 Project File Structure

```
newhitsapp/
├── app/                          # Next.js App Router (pages and routes)
│   ├── (auth)/                  # Authentication pages (login, register, etc.)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx           # Auth layout (includes Footer)
│   │
│   ├── (dashboard)/             # Protected dashboard pages
│   │   ├── admin/               # Admin dashboard pages
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── appointments/page.tsx
│   │   │   └── layout.tsx      # Admin layout (includes Footer)
│   │   │
│   │   ├── senior/              # Senior/Client dashboard pages
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── book-appointment/page.tsx
│   │   │   ├── my-appointments/page.tsx
│   │   │   └── layout.tsx       # Senior layout (includes Footer)
│   │   │
│   │   └── specialist/          # Specialist dashboard pages
│   │       ├── dashboard/page.tsx
│   │       ├── appointments/page.tsx
│   │       └── layout.tsx       # Specialist layout (includes Footer)
│   │
│   ├── (public)/                # Public pages (no auth required)
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── privacy/page.tsx     # Privacy Policy
│   │   ├── terms/page.tsx       # Terms of Service
│   │   ├── safety/page.tsx      # Safety & Security Policy
│   │   ├── specialists/page.tsx
│   │   └── layout.tsx           # Public layout (includes MarketingHeader + Footer)
│   │
│   ├── api/                     # API routes (backend endpoints)
│   │   ├── appointments/       # Appointment-related APIs
│   │   ├── auth/               # Authentication APIs
│   │   ├── gemini/             # AI chatbot APIs
│   │   ├── membership/         # Membership APIs
│   │   ├── payments/           # Payment APIs
│   │   ├── stripe/             # Stripe webhooks
│   │   └── travel/              # Travel fee calculation
│   │
│   ├── about/page.tsx           # About page (standalone)
│   ├── plans/page.tsx           # Pricing page (standalone)
│   ├── consumer-services/page.tsx
│   ├── enterprise-services/page.tsx
│   ├── news/page.tsx
│   ├── howto-offerings/page.tsx
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx               # Root layout (includes chatbot)
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── Footer.tsx               # Site footer (used on all pages)
│   ├── MarketingHeader.tsx      # Public site header
│   ├── DashboardHeader.tsx      # Dashboard header
│   ├── ClientChatbotWrapper.tsx  # Chatbot wrapper
│   │
│   ├── features/                # Feature-specific components
│   │   ├── AIChatbot.tsx        # AI chatbot component
│   │   ├── PaymentForm.tsx      # Payment forms
│   │   └── ...
│   │
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   │
│   └── account/                 # Account-related components
│
├── lib/                          # Utility libraries
│   ├── supabase/                # Supabase client setup
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Middleware
│   │
│   ├── gemini/                  # Google Gemini AI integration
│   │   ├── chat.ts             # Chat functionality
│   │   └── matching.ts         # Specialist matching
│   │
│   ├── stripe/                  # Stripe integration
│   │   └── client.ts
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   └── useMembership.ts   # Membership hook
│   │
│   └── utils/                   # Utility functions
│
├── types/                        # TypeScript type definitions
│   └── index.ts
│
├── public/                       # Static assets
│   └── images/                  # Image files
│
├── .env.local                    # Environment variables (DO NOT COMMIT)
├── env.example                   # Environment variable template
├── package.json                  # Dependencies and scripts
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 📝 How to Update Content

### 1. Updating Policy Pages

**Privacy Policy** (`app/(public)/privacy/page.tsx`)
- Edit the content directly in the file
- Maintain the existing structure and styling
- Update the "Last updated" date when making changes

**Terms of Service** (`app/(public)/terms/page.tsx`)
- Edit the content directly in the file
- Maintain paragraph breaks for readability
- Update the "Last updated" date when making changes

**Safety & Security** (`app/(public)/safety/page.tsx`)
- Edit the content directly in the file
- Maintain the emergency disclaimer section at the top
- Update the "Last updated" date when making changes

### 2. Updating Footer

**Footer Component** (`components/Footer.tsx`)
- Contains newsletter subscription form
- Contains footer links (Privacy, Terms, Safety)
- Contains copyright and disclaimer text
- Update links, text, or contact information as needed

**To update footer links:**
```tsx
// In components/Footer.tsx, around line 127-139
<Link href="/privacy">Privacy Policy</Link>
<Link href="/terms">Terms of Service</Link>
<Link href="/safety">Safety & Security</Link>
```

**To update contact information:**
```tsx
// In components/Footer.tsx, around line 50-51
<a href="mailto:support@hitsapp.com">support@hitsapp.com</a>
<li className="font-extrabold text-primary-700">(646) 758-6606</li>
```

**To update Member Support link:**
```tsx
// In components/Footer.tsx, around line 36-44
<a 
  href="https://sos.splashtop.com"  // Update this URL
  target="_blank" 
  rel="noopener noreferrer"
>
  Member Support (Remote Help)
</a>
```

### 3. Updating About Page / Founder Bio

**About Page** (`app/about/page.tsx`)
- Founder bio section starts around line 294
- Edit the text content directly
- Use separate `<p>` tags for each paragraph to maintain line breaks

**Example:**
```tsx
<p>
  First paragraph text here.
</p>
<p>
  Second paragraph text here.
</p>
<p>
  Third paragraph text here.
</p>
```

### 4. Updating Homepage Content

**Homepage** (`app/page.tsx`)
- Edit sections directly in the file
- Maintain the motion animations structure
- Update text, links, or images as needed

### 5. Updating Pricing/Plans Page

**Pricing Page** (`app/plans/page.tsx`)
- Edit membership plan details directly
- Update pricing, features, or descriptions
- Maintain the card structure for consistency

### 6. Updating Chatbot

**Chatbot Component** (`components/features/AIChatbot.tsx`)
- Edit the welcome message
- Update the "Book an Appointment" button link if needed
- Modify chatbot behavior in `lib/gemini/chat.ts`

**To update chatbot responses:**
- Edit `lib/gemini/chat.ts`
- Modify the system prompt or common questions
- Update the AI matching logic in `lib/gemini/matching.ts`

---

## 🚀 How to Push Changes

### Prerequisites

1. **Git Setup**
   - Ensure you have Git installed
   - Have access to the repository (GitHub/GitLab)
   - Your SSH keys or credentials configured

2. **Node.js Setup**
   - Node.js 18+ installed
   - npm installed

### Step-by-Step: Making and Pushing Changes

#### 1. Check Current Status

```bash
# See what files have changed
git status

# See the actual changes
git diff
```

#### 2. Stage Your Changes

```bash
# Stage all changes
git add .

# OR stage specific files
git add app/about/page.tsx
git add components/Footer.tsx
```

#### 3. Commit Your Changes

```bash
# Commit with a descriptive message
git commit -m "Update founder bio with new education details"

# OR for multiple changes
git commit -m "Update footer links and privacy policy content"
```

**Good commit messages:**
- "Update Privacy Policy - November 2025"
- "Fix footer separator alignment"
- "Update Member Support link to Splashtop"
- "Add line breaks to founder bio section"

**Bad commit messages:**
- "fix"
- "update"
- "changes"

#### 4. Push to Repository

```bash
# Push to main branch (triggers automatic deployment on Vercel)
git push origin main

# OR if working on a different branch
git push origin your-branch-name
```

#### 5. Verify Deployment

1. Go to your Vercel dashboard
2. Check the "Deployments" tab
3. Wait for the build to complete (usually 2-5 minutes)
4. Click on the deployment to see build logs
5. Visit your live site to verify changes

---

## 🔧 Maintenance Instructions

### Regular Maintenance Tasks

#### 1. Update Dependencies (Monthly)

```bash
# Check for outdated packages
npm outdated

# Update packages (be careful - test thoroughly)
npm update

# OR update specific packages
npm install package-name@latest
```

**Important:** After updating dependencies:
- Test the application thoroughly
- Check for breaking changes in changelogs
- Update TypeScript types if needed

#### 2. Environment Variables

**Location:** `.env.local` (local) and Vercel Dashboard (production)

**Required Variables:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_FRONTEND_KEY=your_maps_key

# Email (Nodemailer)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_from_email
```

**To update in Vercel:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add/Edit/Delete variables
5. Redeploy after changes

#### 3. Database Maintenance

**Accessing Supabase:**
1. Go to https://supabase.com
2. Log in to your account
3. Select your project
4. Use SQL Editor for queries
5. Use Table Editor for data management

**Common Tasks:**
- View user data: Table Editor > `users` table
- View appointments: Table Editor > `appointments` table
- View payments: Table Editor > `payments` table
- Run SQL queries: SQL Editor

**Backup:**
- Supabase automatically backs up your database
- Manual backup: Export data via SQL Editor or use Supabase CLI

#### 4. Content Updates Checklist

When updating content, check:

- [ ] Policy pages (Privacy, Terms, Safety) have correct "Last updated" dates
- [ ] Footer links are working correctly
- [ ] Contact information is current
- [ ] All links open correctly (test in new tab)
- [ ] Images load properly
- [ ] Text formatting is consistent
- [ ] No broken links or typos

#### 5. Testing Before Deployment

**Local Testing:**
```bash
# Start development server
npm run dev

# Visit http://localhost:3000
# Test all pages you modified
# Check mobile responsiveness
# Test forms and interactions
```

**Checklist:**
- [ ] Pages load without errors
- [ ] Links work correctly
- [ ] Forms submit properly
- [ ] Mobile view looks good
- [ ] Footer appears on all pages
- [ ] No console errors

#### 6. Common Issues and Fixes

**Issue: Changes not showing on live site**
- **Fix:** Check Vercel deployment logs for build errors
- **Fix:** Clear browser cache
- **Fix:** Verify environment variables are set correctly

**Issue: Build fails on Vercel**
- **Fix:** Check build logs for specific errors
- **Fix:** Verify all dependencies are in `package.json`
- **Fix:** Check for TypeScript errors: `npm run type-check`

**Issue: Footer not appearing on a page**
- **Fix:** Ensure the page uses a layout that includes Footer
- **Fix:** Check `app/(public)/layout.tsx` or dashboard layouts

**Issue: Double headers on pages**
- **Fix:** Remove `MarketingHeader` from individual pages if layout already includes it
- **Fix:** Check layout files for duplicate headers

#### 7. Performance Monitoring

**Vercel Analytics:**
- Check Vercel dashboard for performance metrics
- Monitor page load times
- Check for errors in production

**Supabase Monitoring:**
- Check Supabase dashboard for database performance
- Monitor API usage
- Check for slow queries

#### 8. Security Maintenance

**Regular Tasks:**
- [ ] Review and rotate API keys annually
- [ ] Update dependencies for security patches
- [ ] Review user access and permissions
- [ ] Check for exposed secrets in code
- [ ] Review Supabase RLS policies

**Security Checklist:**
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] All API keys are in environment variables
- [ ] Stripe webhook secret is configured
- [ ] Supabase RLS is enabled on all tables

---

## 📋 Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Check code quality
npm run type-check       # Check TypeScript types

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push origin main     # Push to repository
```

### Important File Locations

| Content Type | File Location |
|-------------|---------------|
| Privacy Policy | `app/(public)/privacy/page.tsx` |
| Terms of Service | `app/(public)/terms/page.tsx` |
| Safety Policy | `app/(public)/safety/page.tsx` |
| Footer | `components/Footer.tsx` |
| Homepage | `app/page.tsx` |
| About Page | `app/about/page.tsx` |
| Pricing Page | `app/plans/page.tsx` |
| Chatbot | `components/features/AIChatbot.tsx` |
| Header (Public) | `components/MarketingHeader.tsx` |
| Header (Dashboard) | `components/DashboardHeader.tsx` |

### Deployment URLs

- **Production:** Check Vercel dashboard for your domain
- **Staging:** Usually `your-project.vercel.app`
- **Local:** `http://localhost:3000`

### Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs:**
   - Vercel deployment logs
   - Browser console (F12)
   - Terminal output (for local dev)

2. **Review documentation:**
   - This maintenance guide
   - `DOCUMENTATION_INDEX.md` for detailed docs
   - Component files for inline comments

3. **Common solutions:**
   - Clear browser cache
   - Restart dev server
   - Check environment variables
   - Verify Git push was successful

---

## 📅 Maintenance Schedule

**Weekly:**
- Check for broken links
- Review error logs
- Monitor site performance

**Monthly:**
- Update dependencies (if needed)
- Review and update content
- Check security updates

**Quarterly:**
- Review and rotate API keys
- Update policy pages if needed
- Review user feedback and make improvements

**Annually:**
- Major dependency updates
- Security audit
- Performance optimization review

---

**Last Updated:** December 2024  
**Version:** 1.0

