import express from 'express';
import { analyzeReview } from '../services/aiClient.js';
const router = express.Router();

router.post('/', async (req, res) => {
    const { review } = req.body;

    if(!review) {
        return res.status(400).json({
            message : "Review text is required."
        })
    }

    try {
        const result = await analyzeReview(review);
        console.log("Result from analyzeReview:", result);
        res.json(result);
    } catch(e) {
        console.error("Error in review API:", e.message);
        
        res.status(500).json({
            error: e.message
        })
    }
});

export default router;