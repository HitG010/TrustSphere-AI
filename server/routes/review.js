import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
    const { productId, reviewText } = req.body;


    res.json({
        productId,
        trustScore: 87,
    });
});

export default router;
