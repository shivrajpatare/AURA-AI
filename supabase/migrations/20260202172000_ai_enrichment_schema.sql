-- Add enrichment columns to reports table
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS ai_risk_level TEXT,
ADD COLUMN IF NOT EXISTS ai_health_flag BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_environment_flag BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_severity_score INT,
ADD COLUMN IF NOT EXISTS ai_ward TEXT,
ADD COLUMN IF NOT EXISTS ai_department TEXT,
ADD COLUMN IF NOT EXISTS ai_enriched_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ai_pipeline_status TEXT DEFAULT 'pending';

-- Create a function to trigger the AI enrichment Edge Function
-- This function uses net.http_post to call the Edge Function asynchronously
CREATE OR REPLACE FUNCTION public.trigger_process_report_ai()
RETURNS TRIGGER AS $$
BEGIN
  -- We use the project reference in the URL. 
  -- Note: The specific project URL should be configured in the Supabase dashboard
  -- or via a vault secret for full flexibility, but here we provide the structure.
  -- In a real setup, you'd use: 'https://' || current_setting('app.settings.project_ref') || '.functions.supabase.co/process-report-ai'
  -- For now, we use a placeholder or assume the environment has the project ref.
  PERFORM
    net.http_post(
      url := 'http://localhost:54321/functions/v1/process-report-ai',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object('report_id', NEW.id)
    );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: If the HTTP request fails, we don't want to block the report insertion.
    -- We can log this or simply allow the row to be created with ai_pipeline_status = 'pending'.
    RAISE WARNING 'Failed to trigger AI enrichment for report %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS after_report_insert ON public.reports;
CREATE TRIGGER after_report_insert
AFTER INSERT ON public.reports
FOR EACH ROW
WHEN (NEW.ai_confidence IS NOT NULL)
EXECUTE FUNCTION public.trigger_process_report_ai();

-- Comment for clarity
COMMENT ON TRIGGER after_report_insert ON public.reports IS 'Triggers the background AI enrichment pipeline after a report is analyzed and inserted.';
