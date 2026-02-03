import { Router } from 'express';

const router = Router();

// GET /api/reports - Fetch reports (Admin/User logic placeholder)
router.get('/', (req, res) => {
    res.json({ message: "List of reports (Mock)" });
});

import { analyzeImage } from '../services/aiService';

// POST /api/reports/analyze - Analyze an image
router.post('/analyze', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            res.status(400).json({ error: "Image data required" });
            return;
        }

        const result = await analyzeImage(imageBase64);
        res.json(result);

    } catch (error) {
        console.error("Analysis failed:", error);
        res.status(500).json({ error: "Analysis failed" });
    }
});

// POST /api/reports - Submit a new report
router.post('/', (req, res) => {
    // Logic for AI analysis and DB insertion would go here
    // For now, mirroring the "Civic Tech" workflow
    res.status(201).json({
        message: "Report received",
        ticket_id: "T-" + Date.now(),
        status: "pending_analysis"
    });
});

export default router;
