import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Define categories and priorities
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

export const analyzeImage = async (imageBase64: string) => {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing AI API Key");

    // If using OpenRouter/Gemini via OpenAI SDK compatibility
    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1", // Default to OpenRouter for flexibility
    });

    try {
        const response = await openai.chat.completions.create({
            model: "google/gemini-flash-1.5", // Switchable model
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this image and identify the civic/sanitation issue. Respond with JSON only." },
                        { type: "image_url", image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } }
                    ]
                }
            ],
        });

        const content = response.choices[0]?.message?.content || "{}";

        // Clean markdown
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(cleanContent);

        // Map to normalized category
        const categoryInfo = CATEGORY_MAP[analysis.category] || CATEGORY_MAP.other;

        return {
            category: categoryInfo.category,
            priority: categoryInfo.priority,
            confidence: Math.min(1, Math.max(0, analysis.confidence || 0.5)),
            description: analysis.description || 'Issue detected',
            severity_reason: analysis.severity_reason || 'Standard priority assigned'
        };

    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error("Failed to analyze image");
    }
};
