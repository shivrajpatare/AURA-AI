import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { report_id } = await req.json()
        console.log(`Processing enrichment for report: ${report_id}`)

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        )

        // Step 1: Fetch the report
        const { data: report, error: fetchError } = await supabase
            .from("reports")
            .select("*")
            .eq("id", report_id)
            .single()

        if (fetchError || !report) {
            console.error(`Error fetching report ${report_id}:`, fetchError)
            throw new Error(`Report not found or fetch error: ${fetchError?.message}`)
        }

        // Step 2: Advanced Enrichment Logic

        // 2.1 Severity Score (1-5)
        let severity = 1
        const highRiskCategories = ["burning_garbage", "sewage_overflow", "dead_animal", "open_manhole"]

        if (highRiskCategories.includes(report.category)) {
            severity += 2
        }

        if (report.ai_confidence > 0.85) {
            severity += 1
        }

        // 2.2 Flags
        const isBurning = report.category === "burning_garbage"
        const isHealthHazard = ["sewage_overflow", "dead_animal", "stagnant_water"].includes(report.category) || severity >= 4

        // 2.3 Mock Ward/Authority Assignment
        // Using a simple coordinate-based mock logic for Pune
        // Latitude 18.52 is roughly central.
        const ward = report.latitude > 18.5204 ? "Ward A (North)" : "Ward B (South)"
        const department = isHealthHazard ? "Health & Sanitation" : "Solid Waste Management"

        // Step 3: Update the report with enriched data
        const enrichmentData = {
            ai_risk_level: severity >= 4 ? "high" : severity >= 2 ? "medium" : "low",
            ai_health_flag: isHealthHazard,
            ai_environment_flag: isBurning,
            ai_severity_score: Math.min(severity, 5),
            ai_ward: ward,
            ai_department: department,
            ai_enriched_at: new Date().toISOString(),
            ai_pipeline_status: "completed"
        }

        const { error: updateError } = await supabase
            .from("reports")
            .update(enrichmentData)
            .eq("id", report_id)

        if (updateError) {
            console.error(`Error updating enrichment for report ${report_id}:`, updateError)
            throw updateError
        }

        console.log(`Successfully enriched report: ${report_id}`)
        return new Response(
            JSON.stringify({ success: true, message: "Enrichment completed", data: enrichmentData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (err) {
        console.error('Enrichment pipeline error:', err.message)

        // Try to mark as failed if we have a report_id
        try {
            const body = await req.clone().json().catch(() => ({}))
            if (body.report_id) {
                const supabase = createClient(
                    Deno.env.get("SUPABASE_URL")!,
                    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
                )
                await supabase
                    .from("reports")
                    .update({ ai_pipeline_status: "failed" })
                    .eq("id", body.report_id)
            }
        } catch (innerErr) {
            console.error('Failed to update status to failed:', innerErr.message)
        }

        return new Response(
            JSON.stringify({ error: err.message, success: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
