-- Create a secure RPC function to handle citizen feedback
-- This function uses SECURITY DEFINER to bypass RLS, allowing public submissions without broad update permissions
CREATE OR REPLACE FUNCTION public.submit_report_feedback(
    report_id UUID,
    verified BOOLEAN,
    feedback TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.reports
    SET 
        citizen_verified = verified,
        citizen_feedback = feedback,
        updated_at = now()
    WHERE id = report_id;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.submit_report_feedback(UUID, BOOLEAN, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_report_feedback(UUID, BOOLEAN, TEXT) TO authenticated;

-- Comment for clarity
COMMENT ON FUNCTION public.submit_report_feedback IS 'Allows citizens to confirm or contest report resolution with optional feedback text.';
