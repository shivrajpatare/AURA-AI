-- SQL to Manually Confirm a User
-- Run this in your Supabase Dashboard > SQL Editor

-- Replace with your admin email
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'shivrajgpatare@gmail.com';

-- Verify it worked
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'shivrajgpatare@gmail.com';
