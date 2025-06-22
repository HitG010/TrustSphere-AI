import express from 'express';
import dotenv from "dotenv"
import cors from 'cors';
import reviewRoutes from './routes/review.js';
import logoRoutes from './routes/logoCheck.js';
import graphRoutes from './routes/graph.js';
import ocrRoutes from './routes/ocrMatch.js';
import gradCamRoutes from './routes/gradCam.js'
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({path: './.env'})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/gradcam', express.static(path.join(__dirname, '../data/gradcam_outputs')));

app.use('/api/review', reviewRoutes);
app.use('/api/logo_check', logoRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/ocr_match', ocrRoutes)
app.use('/api/predict-authenticity', gradCamRoutes)

app.get('/', (req, res) => {
    res.send('TrustSphere Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
