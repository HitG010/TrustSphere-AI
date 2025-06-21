import express from "express";
import multer from "multer";
import fs from "fs";
import { sendImageToAI } from "../services/aiClient.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
    try {
        const result = await sendImageToAI(req.file.path);
        fs.unlinkSync(req.file.path);
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: "Failed to analyze image" });
    }
});

export default router;
