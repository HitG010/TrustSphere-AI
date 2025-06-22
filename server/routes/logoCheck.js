import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const router = express.Router();

// Folder for uploaded logo images: trustSphereAI/data/logo_detect
const uploadFolder = path.join(process.cwd(), '..', 'data', 'logo_detect');

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `logo-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    console.log("File uploaded successfully:", req.file);

    const filePath = req.file.path; // full absolute path to the saved file
    console.log("Sending image path to AI backend:", filePath);
    console.log("Does file exist?", fs.existsSync(filePath));

    try {
        const response = await axios.post('http://localhost:8080/api/detect_logo', {
            image_path: filePath
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error calling AI backend:', error.message);
        res.status(500).json({ error: 'Failed to process logo detection' });
    }
});

export default router;

