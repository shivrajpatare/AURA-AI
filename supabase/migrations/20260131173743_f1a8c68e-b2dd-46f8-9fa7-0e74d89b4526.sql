-- Create enum for issue categories (AI auto-detected)
CREATE TYPE public.issue_category AS ENUM (
  'garbage_dump',
  'dustbin_not_cleaned',
  'burning_garbage',
  'open_manhole',
  'stagnant_water',
  'dead_animal',
  'sewage_overflow',
  'sweeping_not_done',
  'other'
);

-- Create enum for priority levels
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create enum for report status
CREATE TYPE public.report_status AS ENUM ('pending', 'in_progress', 'resolved', 'duplicate');

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reporter info (anonymous allowed)
  reporter_name TEXT,
  reporter_phone TEXT,
  
  -- AI-detected fields
  category issue_category NOT NULL DEFAULT 'other',
  priority priority_level NOT NULL DEFAULT 'medium',
  ai_confidence DECIMAL(3,2) DEFAULT 0.00,
  ai_description TEXT,
  
  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  landmark TEXT,
  ward TEXT,
  
  -- Images
  before_image_url TEXT NOT NULL,
  after_image_url TEXT,
  
  -- Status tracking
  status report_status NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  
  -- Duplicate clustering
  cluster_id UUID,
  reporter_count INT DEFAULT 1,
  
  -- Citizen feedback
  citizen_verified BOOLEAN,
  citizen_feedback TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view reports)
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;
CREATE POLICY "Anyone can view reports"
ON public.reports FOR SELECT
USING (true);

-- Public insert access (anonymous reporting allowed)
DROP POLICY IF EXISTS "Anyone can create reports" ON public.reports;
CREATE POLICY "Anyone can create reports"
ON public.reports FOR INSERT
WITH CHECK (true);

-- Public update for citizen feedback
DROP POLICY IF EXISTS "Anyone can update citizen feedback" ON public.reports;
CREATE POLICY "Anyone can update citizen feedback"
ON public.reports FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for report images
DROP POLICY IF EXISTS "Anyone can upload report images" ON storage.objects;
CREATE POLICY "Anyone can upload report images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-images');

DROP POLICY IF EXISTS "Anyone can view report images" ON storage.objects;
CREATE POLICY "Anyone can view report images"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');