# Demo Accounts Setup Instructions

## Overview

This document provides instructions for removing old demo accounts and creating new ones for QA testing.

## Old Demo Accounts to Remove/Deactivate

The following accounts should be deactivated:

1. **Senior Demo**: `ashafiq.bese23seecs@seecs.edu.pk`
2. **Specialist Demo**: `mabdulaharshad@gmail.com`
3. **Admin Demo**: `admin@hitsapp.com`

## New Demo Accounts to Create

Create the following three accounts:

1. **Senior Demo Account**
   - Email: `a_granted@yahoo.com`
   - Role: Senior / Client
   - Password: `helloworld`

2. **Specialist Demo Account**
   - Email: `access525@yahoo.com`
   - Role: IT Specialist
   - Password: `helloworld`

3. **Admin Demo Account**
   - Email: `admin@hitspecialist.com`
   - Role: Admin
   - Password: `helloworld`

## Setup Steps

### Option 1: Using Admin Dashboard (Recommended)

1. **Deactivate Old Accounts**:
   - Log in as current admin
   - Go to `/admin/users`
   - Find each old demo account
   - Click "Deactivate" button for each

2. **Create New Accounts**:
   - In `/admin/users`, click "Create User" button
   - Fill in the form for each new account:
     - Full Name: "Demo Senior User" / "Demo Specialist" / "Admin User"
     - Email: Use the emails listed above
     - Role: Select appropriate role
     - Phone: Optional
   - Click "Create User"
   - A password reset email will be sent to each user
   - Users should set their password to `helloworld` when they receive the email

3. **For Specialist Account**:
   - After creating the specialist account, go to `/admin/users?filter=pending`
   - Find the specialist and click "Verify" to approve them

### Option 2: Using Supabase Dashboard

1. **Deactivate Old Accounts in Database**:
   - Go to Supabase Dashboard > SQL Editor
   - Run the deactivation query from `DEMO_ACCOUNTS_MIGRATION.sql`

2. **Create Auth Users**:
   - Go to Supabase Dashboard > Authentication > Users
   - Click "Add User" for each new account
   - Enter email and set password to `helloworld`
   - Auto-confirm the email

3. **Create User Records**:
   - Go to Supabase Dashboard > SQL Editor
   - Run the INSERT statements from `DEMO_ACCOUNTS_MIGRATION.sql`
   - Replace `USER_ID_FROM_AUTH` with the actual auth user IDs from step 2

4. **Create Profiles**:
   - For senior: Create a record in `senior_profiles` table
   - For specialist: Create a record in `specialist_profiles` table with `verification_status = 'verified'`

### Option 3: Using Supabase Admin API

You can use the Supabase Admin API to create users programmatically. See the API endpoint at `/api/admin/users/create` for reference.

## Verification

After setup, verify the accounts:

1. **Check Old Accounts Are Deactivated**:
   ```sql
   SELECT email, full_name, role, is_active 
   FROM users 
   WHERE email IN (
     'ashafiq.bese23seecs@seecs.edu.pk',
     'mabdulaharshad@gmail.com',
     'admin@hitsapp.com'
   );
   ```
   All should show `is_active = false`

2. **Check New Accounts Exist**:
   ```sql
   SELECT email, full_name, role, is_active 
   FROM users 
   WHERE email IN (
     'a_granted@yahoo.com',
     'access525@yahoo.com',
     'admin@hitspecialist.com'
   );
   ```
   All should show `is_active = true` and correct roles

3. **Test Login**:
   - Try logging in with each new account
   - Verify they can access their respective dashboards
   - Verify specialist is verified and can receive appointments

## Notes

- All passwords are set to `helloworld` for easy QA testing
- The specialist account should be verified immediately after creation
- Old accounts are deactivated (not deleted) to preserve data history
- If you need to completely remove old accounts, delete them from Supabase Auth Dashboard as well

## Troubleshooting

**Issue**: Can't log in with new account
- **Solution**: Verify the account exists in both `auth.users` and `users` table
- Check that `is_active = true` in the users table

**Issue**: Specialist can't receive appointments
- **Solution**: Verify the specialist profile exists and `verification_status = 'verified'`

**Issue**: Admin account doesn't have admin access
- **Solution**: Verify `role = 'admin'` in the users table
- Check that the email matches `admin@hitspecialist.com` exactly

