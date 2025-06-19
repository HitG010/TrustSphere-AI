import express from 'express';
const router = express.Router();

// Dummy GET API for trust graph data
router.get('/', (req, res) => {
    res.json({
        nodes: [
            { id: 'user1', label: 'User 1' },
            { id: 'user2', label: 'User 2' },
            { id: 'user3', label: 'User 3' }
        ],
        links: [
            { source: 'user1', target: 'user2', weight: 0.8 },
            { source: 'user2', target: 'user3', weight: 0.6 }
        ]
    });
});

export default router;

