-- Fix #1: PUBLIC_DATA_EXPOSURE - Protect reporter PII
-- The public_reports view already exists and excludes sensitive fields
-- We need to add RLS policy to deny direct SELECT on base table

-- Drop existing view and recreate with security_invoker
DROP VIEW IF EXISTS public.public_reports;

CREATE VIEW public.public_reports
WITH (security_invoker = on) AS
SELECT 
  id, category, priority, ai_confidence, ai_description,
  latitude, longitude, address, landmark, ward,
  before_image_url, after_image_url, status,
  assigned_to, resolved_at, cluster_id, reporter_count,
  citizen_verified, citizen_feedback, created_at, updated_at
FROM public.reports;

-- Deny direct SELECT on base reports table (use view instead)
DROP POLICY IF EXISTS "No direct select on reports" ON public.reports;
CREATE POLICY "No direct select on reports"
ON public.reports FOR SELECT
USING (false);

-- Fix #2: CLIENT_SIDE_AUTH - Add user roles system for admin authorization

-- Create role enum
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Only admins can update reports (status changes)
DROP POLICY IF EXISTS "Only admins can update reports" ON public.reports;
CREATE POLICY "Only admins can update reports"
ON public.reports FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Explicit deny delete policy for audit trail
DROP POLICY IF EXISTS "No one can delete reports" ON public.reports;
CREATE POLICY "No one can delete reports"
ON public.reports FOR DELETE
USING (false);