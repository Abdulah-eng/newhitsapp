# HITS Platform - Complete Documentation
## Part 1: System Architecture & Deployment Guide

---

## 1️⃣ System Architecture & Tech Stack

### Frameworks & Core Technologies

**Frontend Framework:**
- **Next.js 16.0.1** (React 19.2.0)
  - App Router architecture
  - Server Components and Client Components
  - API Routes for backend functionality
  - Built with TypeScript 5.9.3

**Styling:**
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - Browser compatibility

**UI Components & Libraries:**
- **Framer Motion 12.23.24** - Animations and transitions
- **Lucide React 0.553.0** - Icon library
- **React Hook Form 7.66.0** - Form management
- **Zod 4.1.12** - Schema validation
- **date-fns 4.1.0** - Date manipulation

### Backend & Database

**Database:**
- **Supabase** (PostgreSQL)
  - Database provider: Supabase Cloud
  - Authentication: Supabase Auth
  - Storage: Supabase Storage buckets
  - Real-time subscriptions available
  - Row Level Security (RLS) enabled

**Database Client:**
- **@supabase/supabase-js 2.80.0** - Main client
- **@supabase/ssr 0.7.0** - Server-side rendering support

### Payment Processing

**Stripe Integration:**
- **Stripe 19.3.0** - Payment processing
- **@stripe/stripe-js 8.3.0** - Client-side Stripe
- **@stripe/react-stripe-js 5.3.0** - React components
- **Standard Stripe** (not Connect)
- Webhook-based payment confirmation

### AI & Third-Party Services

**AI Chatbot:**
- **Google Generative AI (@google/generative-ai 0.24.1)**
  - Model: `models/gemini-2.5-flash`
  - Free tier with rate limits
  - Used for HITS chatbot and specialist matching

**Maps & Location:**
- **Google Maps API**
  - Distance Matrix API (backend)
  - Maps JavaScript API (frontend)
  - Two separate API keys for security

**Email Service:**
- **Nodemailer 7.0.10** - SMTP email sending
- Custom SMTP configuration
- Email templates inline in code

### Hosting Platform

**Vercel**
- Production hosting
- Automatic deployments from Git
- Environment variable management
- Serverless functions for API routes

### Development Tools

**Type Checking:**
- TypeScript 5.9.3
- `@types/node 24.10.0`
- `@types/react 19.2.2`
- `@types/react-dom 19.2.2`
- `@types/nodemailer 7.0.4`

**Code Quality:**
- ESLint (via Next.js)
- Prettier (formatting)

---

## 2️⃣ Deployment & Hosting Guide

### Vercel Deployment Setup

#### Initial Deployment

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository (GitHub/GitLab/Bitbucket)
   - Select the repository containing the HITS project

2. **Project Configuration:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (root of repository)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

3. **Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all required variables (see `env.example` file)
   - **Critical variables:**
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY
     STRIPE_SECRET_KEY
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
     STRIPE_WEBHOOK_SECRET
     GEMINI_API_KEY
     GOOGLE_MAPS_BACKEND_KEY
     NEXT_PUBLIC_GOOGLE_MAPS_FRONTEND_KEY
     SMTP_HOST
     SMTP_PORT
     SMTP_USER
     SMTP_PASSWORD
     SMTP_FROM
     NEXT_PUBLIC_APP_URL
     ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - First deployment may take 3-5 minutes

#### Production Branch Configuration

**Default Behavior:**
- Vercel automatically deploys from the **main** or **master** branch
- Each push to main/master triggers a new production deployment
- Preview deployments are created for pull requests

**To Change Production Branch:**
1. Go to Project Settings → Git
2. Select your preferred production branch
3. Save changes

**Branch Strategy:**
- **Production:** `main` or `master` branch
- **Staging/Preview:** Any other branch or pull request

### Viewing Deployment Logs

1. **Access Logs:**
   - Go to your project in Vercel Dashboard
   - Click on a specific deployment
   - Click "View Function Logs" or "View Build Logs"

2. **Real-time Logs:**
   - During deployment: View build logs in real-time
   - After deployment: View runtime logs for API routes
   - Filter by function name or search logs

3. **Log Retention:**
   - Build logs: Available for all deployments
   - Function logs: Available for recent deployments
   - Export logs if needed for long-term storage

### Managing Environment Variables

#### Adding/Changing Variables

1. **Via Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Click "Add New" or edit existing
   - Enter variable name and value
   - Select environments (Production, Preview, Development)
   - Click "Save"

2. **Important Notes:**
   - Changes require a new deployment to take effect
   - Use "Redeploy" button to apply changes immediately
   - Never commit `.env.local` files to Git
   - Use Vercel's environment variables for all secrets

3. **Environment-Specific Variables:**
   - **Production:** Used in production deployments
   - **Preview:** Used in preview deployments (PRs)
   - **Development:** Used in local development (if using Vercel CLI)

#### Critical Variables to Update After Handoff

**Stripe Credentials:**
```
STRIPE_SECRET_KEY=sk_live_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

**SMTP Credentials:**
```
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
SMTP_FROM="HITS Notifications <noreply@yourdomain.com>"
```

**Supabase Credentials:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Domain Setup & Management

#### Adding Custom Domain

1. **In Vercel Dashboard:**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter your domain name (e.g., `hitsapp.com`)

2. **DNS Configuration:**
   - Vercel will provide DNS records to add
   - Add records to your domain registrar:
     - **A Record:** Point to Vercel IP
     - **CNAME Record:** Point to Vercel domain
   - Wait for DNS propagation (can take up to 48 hours)

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - HTTPS is enabled by default
   - Certificate auto-renews

#### Domain Management

- **Primary Domain:** Set in Project Settings → Domains
- **Redirects:** Configure in `vercel.json` or Vercel Dashboard
- **Subdomains:** Add as separate domains (e.g., `www.hitsapp.com`)

### Redeployment Process

**Automatic:**
- Every push to production branch triggers deployment
- Pull requests create preview deployments

**Manual Redeploy:**
1. Go to Deployments tab
2. Find the deployment you want to redeploy
3. Click "..." menu → "Redeploy"
4. Or click "Redeploy" button on latest deployment

**Rollback:**
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"

### Build Configuration

**File:** `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}

module.exports = nextConfig
```

**Build Script:** `npm run build`
- Runs TypeScript type checking
- Compiles Next.js application
- Optimizes production bundle
- Generates static pages where possible

---

## Next Steps

See `DOCUMENTATION_PART_2_DATABASE_AND_ROLES.md` for:
- Database schema documentation
- User roles and permissions
- Admin access instructions

