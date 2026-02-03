import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Report {
    id: string;
    category: string;
    priority: string;
    status: string;
    address: string;
    latitude: number;
    longitude: number;
    before_image_url: string;
    // Handling nullable fields from DB
    after_image_url: string | null;
    ai_description: string | null;
    created_at: string;
    resolved_at: string | null;
    assigned_at: string | null;
    in_progress_at: string | null;
    citizen_verified: boolean | null;
    citizen_feedback: string | null;
    user_id?: string;
}

export const reportService = {
    /**
     * Fetch all reports submitted by the current authenticated user.
     */
    async getUserReports(userId: string): Promise<Report[]> {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user reports:', error);
            throw error;
        }

        return (data || []) as unknown as Report[];
    },

    /**
     * Fetch a single report by ID using a secure RPC call.
     * This works for both authenticated and unauthenticated users.
     */
    async getReportById(reportId: string): Promise<Report | null> {
        // RPC is new, so likely not in generated types yet. Cast to any to avoid TS error.
        const { data, error } = await (supabase.rpc as any)('get_report_by_id', { p_report_id: reportId });

        if (error) {
            console.error('Error searching report:', error);
            throw error;
        }

        // RPC returns a list (table), but we expect one or zero
        if (data && Array.isArray(data) && data.length > 0) {
            return data[0] as unknown as Report;
        }

        return null;
    },

    /**
     * Submit feedback for a resolved report.
     */
    async submitFeedback(reportId: string, verified: boolean, feedback: string | null): Promise<void> {
        const { error } = await supabase.rpc('submit_report_feedback', {
            report_id: reportId,
            verified: verified,
            feedback: feedback
        });

        if (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    }
};
