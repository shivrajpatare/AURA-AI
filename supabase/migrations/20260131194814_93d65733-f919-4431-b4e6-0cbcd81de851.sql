-- Fix: Protect PII by restricting direct table access and using definer-mode view

-- Step 1: Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;

-- Step 2: Add policy that denies direct SELECT (forces use of view)
DROP POLICY IF EXISTS "No direct select - use view" ON public.reports;
CREATE POLICY "No direct select - use view"
ON public.reports FOR SELECT
USING (false);

-- Step 3: Recreate view WITHOUT security_invoker (uses owner's privileges by default)
-- This allows the view to query the table while hiding PII
DROP VIEW IF EXISTS public.public_reports;

CREATE VIEW public.public_reports AS
SELECT 
    id,
    category,
    priority,
    ai_confidence,
    latitude,
    longitude,
    status,
    resolved_at,
    cluster_id,
    reporter_count,
    ward,
    citizen_verified,
    before_image_url,
    created_at,
    after_image_url,
    ai_description,
    landmark,
    address,
    assigned_to,
    updated_at,
    citizen_feedback
    -- EXCLUDES: reporter_name, reporter_phone (PII protected)
FROM public.reports;

-- Step 4: Grant SELECT on view to anon and authenticated roles
GRANT SELECT ON public.public_reports TO anon;
GRANT SELECT ON public.public_reports TO authenticated;

-- Step 5: Clean up duplicate INSERT policies
DROP POLICY IF EXISTS "Public insert" ON public.reports;