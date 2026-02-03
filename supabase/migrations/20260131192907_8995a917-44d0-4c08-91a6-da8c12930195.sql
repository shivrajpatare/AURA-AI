-- Fix Security Definer View issue
-- Drop and recreate the view to ensure security_invoker is properly set

DROP VIEW IF EXISTS public.public_reports;

CREATE VIEW public.public_reports
WITH (security_invoker = true) AS
SELECT 
  id, category, priority, ai_confidence, ai_description,
  latitude, longitude, address, landmark, ward,
  before_image_url, after_image_url, status,
  assigned_to, resolved_at, cluster_id, reporter_count,
  citizen_verified, citizen_feedback, created_at, updated_at
FROM public.reports;