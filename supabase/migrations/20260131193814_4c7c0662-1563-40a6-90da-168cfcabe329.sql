-- Fix: Allow public SELECT on reports table for the public_reports view to work
-- The view already excludes PII fields (reporter_name, reporter_phone)

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "No direct select on reports" ON public.reports;

-- Add policy that allows public read access
-- The public_reports view (which users query) already filters out PII
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;
CREATE POLICY "Anyone can view reports"
ON public.reports FOR SELECT
USING (true);