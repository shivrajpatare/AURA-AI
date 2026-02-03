
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CATEGORY_MAP: Record<string, { category: string; priority: string }> = {
  garbage_dump: { category: 'garbage_dump', priority: 'medium' },
  dustbin_not_cleaned: { category: 'dustbin_not_cleaned', priority: 'medium' },
  burning_garbage: { category: 'burning_garbage', priority: 'critical' },
  open_manhole: { category: 'open_manhole', priority: 'high' },
  stagnant_water: { category: 'stagnant_water', priority: 'high' },
  dead_animal: { category: 'dead_animal', priority: 'critical' },
  sewage_overflow: { category: 'sewage_overflow', priority: 'critical' },
  sweeping_not_done: { category: 'sweeping_not_done', priority: 'low' },
  other: { category: 'other', priority: 'medium' },
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // 5 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting (fallback for anonymous users)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    // Check for authentication (optional but preferred)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_ANON_KEY')!,
          { global: { headers: { Authorization: authHeader } } }
        );

        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await supabase.auth.getUser(token);

        if (!error && data?.user) {
          userId = data.user.id;
        }
      } catch (authError) {
        console.error('Auth check failed:', authError);
        // Continue without auth - allow anonymous with stricter rate limits
      }
    }

    // Rate limit identifier: use userId if authenticated, otherwise IP
    const rateLimitId = userId || `ip:${clientIP}`;

    // Apply stricter rate limits for anonymous users
    const effectiveRateLimit = userId ? RATE_LIMIT_MAX : 2; // 2 req/min for anonymous

    if (!checkRateLimit(rateLimitId)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate image size (base64 is ~33% larger than binary)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    const estimatedSize = (imageBase64.length * 3) / 4;
    if (estimatedSize > maxSizeBytes) {
      return new Response(
        JSON.stringify({ error: 'Image too large. Maximum size is 10MB.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }

    const systemPrompt = `You are an AI assistant for a civic issue reporting system in Pune, India. 
Analyze the image and identify the type of urban sanitation/cleanliness issue.

You MUST respond with a JSON object containing:
- category: One of: garbage_dump, dustbin_not_cleaned, burning_garbage, open_manhole, stagnant_water, dead_animal, sewage_overflow, sweeping_not_done, other
- confidence: A number between 0 and 1 indicating how confident you are
- description: A brief description of the issue (max 100 words)
- severity_reason: Why you assigned this priority level

Category definitions:
- garbage_dump: Pile of trash/garbage on streets or public areas
- dustbin_not_cleaned: Overflowing or uncleaned public dustbins
- burning_garbage: Smoke or fire from burning waste
- open_manhole: Uncovered manholes or drainage openings
- stagnant_water: Stagnant/dirty water accumulation
- dead_animal: Dead animal carcass on public property
- sewage_overflow: Sewage or drain overflow
- sweeping_not_done: Unswept streets with leaves/dust
- other: Any other cleanliness issue

IMPORTANT: Respond ONLY with valid JSON, no markdown, no extra text.`;

    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image and identify the civic/sanitation issue. Respond with JSON only.' },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';

    // Parse the JSON response from AI
    let analysis;
    try {
      // Clean up potential markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback response
      analysis = {
        category: 'other',
        confidence: 0.5,
        description: 'Unable to analyze image. Please verify the issue type manually.',
        severity_reason: 'Manual verification required'
      };
    }

    // Map category to priority
    const categoryInfo = CATEGORY_MAP[analysis.category] || CATEGORY_MAP.other;

    const result = {
      category: categoryInfo.category,
      priority: categoryInfo.priority,
      confidence: Math.min(1, Math.max(0, analysis.confidence || 0.5)),
      description: analysis.description || 'Issue detected',
      severity_reason: analysis.severity_reason || 'Standard priority assigned'
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log detailed error server-side only
    console.error('Error in analyze-issue function:', error);
    // Return generic message to client - don't leak internal details
    return new Response(
      JSON.stringify({ error: 'Unable to analyze image at this time. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
