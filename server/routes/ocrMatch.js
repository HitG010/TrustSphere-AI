import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const router = express.Router();

const uploadFolder = path.join(process.cwd(), '..', 'data', 'logo_detect');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadFolder);
    },
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `ocr-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    const referenceText = req.body.referenceText;
    if (!referenceText) {
        return res.status(400).json({ error: 'Reference text is required' });
    }

    const filePath = req.file.path;

    try {
        const response = await axios.post('http://localhost:8080/api/ocr_match', {
            image_path: filePath,
            reference_text: referenceText
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error calling OCR backend:', error.message);
        res.status(500).json({ error: 'Failed to process OCR match' });
    }
});

export default router;
