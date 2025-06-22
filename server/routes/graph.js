import express from "express";
const router = express.Router();
import { getGraphData } from "../services/aiClient.js";

router.post("/", async (req, res) => {
    const { productId } = req.body || {};
    // if(!productId) {
    //     console.log();
        
    //     return res.status(400).json({
    //         message: "Enter a valid productId."
    //     })
    // }
    try {
        const graphData = await getGraphData(productId);
        res.json(graphData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch graph data" });
    }
});

export default router;