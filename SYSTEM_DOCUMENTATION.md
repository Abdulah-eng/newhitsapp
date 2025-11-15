# HITS Platform - System Documentation

## Tech Stack Overview

### Framework
- **Next.js 15** (App Router)
- **React 18+**
- **TypeScript**

### Database
- **Supabase** (PostgreSQL)
- **Row-Level Security (RLS)** enabled
- **Real-time subscriptions** for live updates

### Authentication
- **Supabase Auth**
- **Email/password authentication**
- **Password reset flows**

### Payment Processing
- **Stripe** (API version: 2025-10-29.clover)
- **Payment Intents** for one-time payments
- **Subscriptions** for membership plans
- **Webhooks** for payment status updates

### External APIs
- **Google Maps Distance Matrix API** (travel distance calculation)
- **Google Maps JavaScript API** (map display)

### Styling
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Custom design system** (primary, secondary, accent colors)

### Key Libraries
- `@supabase/ssr` - Supabase server-side rendering
- `@supabase/supabase-js` - Supabase client
- `stripe` - Stripe payment processing
- `framer-motion` - Animation library
- `lucide-react` - Icon library

## Deployment

### Hosting Platform
- **Vercel** (recommended for Next.js)
- Alternative: Any Node.js hosting platform

### Deployment Steps

1. **Connect Repository**:
   - Link GitHub/GitLab repository to Vercel
   - Vercel will auto-detect Next.js configuration

2. **Set Environment Variables**:
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all variables from `env.example` (see below)

3. **Deploy**:
   - Push to main branch triggers automatic deployment
   - Or manually trigger deployment from Vercel dashboard

4. **Verify**:
   - Check deployment logs for errors
   - Test authentication, payments, and core features

### Environment Variables

All environment variables must be set in Vercel (or your hosting platform):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google Maps
GOOGLE_MAPS_BACKEND_KEY=your_backend_key
NEXT_PUBLIC_GOOGLE_MAPS_FRONTEND_KEY=your_frontend_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Important**: Never commit `.env.local` to version control. Use Vercel's environment variable settings.

## Updating Environment Variables

### In Vercel

1. Go to Project Settings > Environment Variables
2. Add/Edit/Delete variables as needed
3. Redeploy application (or wait for next deployment)

### In Local Development

1. Create `.env.local` file in project root
2. Copy variables from `env.example`
3. Fill in actual values
4. Restart development server

## Admin Settings

### Accessing Admin Settings

1. Log in as admin user
2. Navigate to `/admin/settings`
3. Update platform configuration

### Configurable Settings

**Pricing**:
- First hour rate (default: $95)
- Additional 30-minute rate (default: $45)
- Minimum appointment duration (in-home: 1 hour, remote: 30 minutes)

**Travel Fees**:
- Free radius (default: 20 miles)
- Per-mile rate beyond radius (default: $1.00)
- Tech payout percentage (default: 60%)

**Platform Fees**:
- Platform fee percentage (default: varies by plan)
- Membership discount rates

**Appointment Settings**:
- Minimum booking notice (hours in advance)
- Maximum booking window (days in advance)
- Cancellation policy (hours before appointment)

**Notification Settings**:
- Email notifications enabled/disabled
- SMS notifications (if configured)
- Admin notification preferences

### Updating Settings

1. Navigate to `/admin/settings`
2. Modify values in form fields
3. Click "Save Settings"
4. Changes take effect immediately (no restart required)

## Database Management

### Accessing Database

1. **Supabase Dashboard**:
   - Go to https://supabase.com
   - Select your project
   - Navigate to SQL Editor

2. **Direct Connection**:
   - Use PostgreSQL connection string from Supabase
   - Connect with pgAdmin, DBeaver, or similar tool

### Common Database Operations

**View Users**:
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

**View Appointments**:
```sql
SELECT * FROM appointments WHERE status = 'pending';
```

**View Payments**:
```sql
SELECT * FROM payments WHERE status = 'completed' ORDER BY created_at DESC;
```

**Update User Status**:
```sql
UPDATE users SET is_active = false WHERE id = 'user_id_here';
```

### Running Migrations

1. Create SQL migration file (e.g., `USER_MANAGEMENT_SCHEMA.sql`)
2. Copy SQL content
3. Paste into Supabase SQL Editor
4. Run script
5. Verify changes in Table Editor

### Backup and Restore

**Supabase Automatic Backups**:
- Daily backups retained for 7 days
- Weekly backups retained for 4 weeks
- Access via Supabase Dashboard > Database > Backups

**Manual Backup**:
1. Use Supabase Dashboard > Database > Backups
2. Or use `pg_dump` with connection string
3. Store backups securely

## Updating Pricing

### Service Pricing

1. **Via Admin Settings** (Recommended):
   - Go to `/admin/settings`
   - Update "First Hour Rate" and "Additional 30-Minute Rate"
   - Save settings

2. **Via Database** (Advanced):
   ```sql
   UPDATE platform_settings 
   SET default_hourly_rate = 95.00,
       additional_30min_rate = 45.00
   WHERE id = 'settings_id';
   ```

3. **Update Display Copy**:
   - Edit `app/plans/page.tsx` for pricing page
   - Edit `app/(public)/faq/page.tsx` for FAQ answers
   - Update any hardcoded pricing references

### Travel Fee Pricing

1. **Update Calculation Logic**:
   - Edit `app/api/travel/calculate/route.ts`
   - Modify mileage pricing constants

2. **Update Documentation**:
   - Update `GOOGLE_MAPS_DOCUMENTATION.md`
   - Update FAQ page

## Updating Platform Fee Percentage

1. **Via Admin Settings**:
   - Go to `/admin/settings`
   - Update "Platform Fee Percentage"
   - Save settings

2. **Via Database**:
   ```sql
   UPDATE platform_settings 
   SET platform_fee = 0.15  -- 15%
   WHERE id = 'settings_id';
   ```

## Notification Settings

### Email Notifications

**Configure SMTP** (if using custom email):
1. Set environment variables:
   ```bash
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASSWORD=your_password
   ```

2. **Supabase Email** (default):
   - Uses Supabase's built-in email service
   - Configure templates in Supabase Dashboard > Authentication > Email Templates

### Disable Notifications

1. Go to `/admin/settings`
2. Toggle "Email Notifications" off
3. Save settings

## Troubleshooting

### Common Issues

**1. Payment Webhooks Not Working**:
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check Stripe Dashboard > Webhooks for delivery status
- Ensure webhook endpoint is accessible: `/api/stripe/webhook`

**2. Google Maps API Errors**:
- Verify API keys are set in environment variables
- Check Google Cloud Console for API quotas
- Ensure Distance Matrix API is enabled

**3. Database Connection Issues**:
- Verify Supabase credentials in environment variables
- Check Supabase project status
- Verify RLS policies allow access

**4. Authentication Issues**:
- Check Supabase Auth settings
- Verify email templates are configured
- Check for RLS policy conflicts

### Getting Help

1. **Check Logs**:
   - Vercel: Project > Deployments > View Function Logs
   - Supabase: Project > Logs

2. **Review Documentation**:
   - This file
   - `GOOGLE_MAPS_DOCUMENTATION.md`
   - Code comments

3. **Contact Support**:
   - For platform issues: support@hitsapp.com
   - For Supabase: Supabase support
   - For Stripe: Stripe support

## Transfer of Ownership

### For New Developer

1. **Access Credentials**:
   - Supabase project access
   - Vercel account access
   - Stripe account access
   - Domain registrar access

2. **Documentation**:
   - This file
   - `GOOGLE_MAPS_DOCUMENTATION.md`
   - Database schema files
   - API documentation

3. **Code Repository**:
   - GitHub/GitLab repository access
   - All environment variables
   - Deployment configuration

4. **Third-Party Services**:
   - Google Cloud Console (Maps API)
   - Email service provider (if custom)
   - Analytics tools (if any)

### Handoff Checklist

- [ ] All environment variables documented
- [ ] Database access provided
- [ ] Deployment access provided
- [ ] Third-party service access provided
- [ ] Code repository access provided
- [ ] Documentation reviewed
- [ ] Test deployment completed
- [ ] Production deployment verified

## Maintenance Schedule

### Daily
- Monitor error logs
- Check payment processing
- Review user registrations

### Weekly
- Review appointment bookings
- Check payment reconciliation
- Monitor API usage (Google Maps, Stripe)

### Monthly
- Review platform metrics
- Update documentation if needed
- Check for security updates
- Review and update pricing if needed

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Enable RLS** on all database tables
4. **Use service role client** only in API routes
5. **Regularly update dependencies** for security patches
6. **Monitor access logs** for suspicious activity
7. **Use HTTPS** for all connections
8. **Implement rate limiting** on API endpoints

## Version History

- **v1.0** - Initial production release
  - User management (seniors, specialists, admins)
  - Appointment booking system
  - Payment processing (Stripe)
  - Travel distance calculation (Google Maps)
  - Admin dashboard
  - Resource management

---

**Last Updated**: [Current Date]
**Maintained By**: HITS Development Team
**Contact**: support@hitsapp.com

