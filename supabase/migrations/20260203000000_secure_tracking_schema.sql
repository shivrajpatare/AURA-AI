-- Add user_id to tracking reports by owner
-- Also add timeline tracking fields
-- Fix RLS policies to enforcing privacy

-- 1. Add new columns
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS in_progress_at TIMESTAMPTZ;

-- 2. Cleanup old/loose policies (drop if exist to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;
DROP POLICY IF EXISTS "No direct select on reports" ON public.reports;
DROP POLICY IF EXISTS "Anyone can create reports" ON public.reports;
DROP POLICY IF EXISTS "Anyone can update citizen feedback" ON public.reports;

-- 3. Define strict policies

-- INSERT: Anyone can insert (anonymous or authenticated)
-- If authenticated, user_id is set by DEFAULT auth.uid()
CREATE POLICY "Anyone can create reports"
ON public.reports FOR INSERT
WITH CHECK (true);

-- SELECT: 
-- A. Users can view their own reports
CREATE POLICY "Users can view own reports"
ON public.reports FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- B. Admins/Moderators can view all reports
CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- C. Explicitly allow lookup by ID via RPC (preferred) or specific ID match?
-- For "Search by ID" for UN-AUTH users, standard RLS makes this hard (cannot selectively allow 1 row based on query param).
-- We will Use SECURITY DEFINER RPC function for unauthenticated ID lookup.

-- UPDATE:
-- A. Admins can update status/fields (Already covered by "Only admins can update reports" in previous migration, but good to be safe)
-- Previous migration "Only admins can update reports" might conflict if we dropped "No direct select".
-- Let's ensure update logic is sound.

-- Allow users to update their own feedback?
CREATE POLICY "Users can update own feedback"
ON public.reports FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Create Secure RPC for ID Lookup (Unauthenticated)
CREATE OR REPLACE FUNCTION public.get_report_by_id(p_report_id UUID)
RETURNS TABLE (
    id UUID,
    category issue_category,
    status report_status,
    priority priority_level,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    before_image_url TEXT,
    after_image_url TEXT,
    ai_description TEXT,
    created_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ,
    in_progress_at TIMESTAMPTZ,
    citizen_verified BOOLEAN,
    citizen_feedback TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id, r.category, r.status, r.priority, r.address, r.latitude, r.longitude,
        r.before_image_url, r.after_image_url, r.ai_description,
        r.created_at, r.resolved_at, r.assigned_at, r.in_progress_at,
        r.citizen_verified, r.citizen_feedback
    FROM public.reports r
    WHERE r.id = p_report_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_report_by_id(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_report_by_id(UUID) TO authenticated;
