import express from 'express';
const router = express.Router();

// Dummy POST API for checking image authenticity
router.post('/', (req, res) => {
    const { imageUrl } = req.body;

    res.json({
        imageUrl,
        isFake: false,
        confidence: 91.5
    });
});

export default router;
