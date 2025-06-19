import express from 'express';
const router = express.Router();

// Dummy GET API for user's overall trust score
router.get('/:userId', (req, res) => {
    const { userId } = req.params;

    res.json({
        userId,
        trustScore: 78.4
    });
});

export default router;
