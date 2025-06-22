import express from 'express';
import dotenv from "dotenv"
import cors from 'cors';
import reviewRoutes from './routes/review.js';
import logoRoutes from './routes/logoCheck.js';
import graphRoutes from './routes/graph.js';
import ocrRoutes from './routes/ocrMatch.js';

dotenv.config({path: './.env'})

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/review', reviewRoutes);
app.use('/api/logo_check', logoRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/ocr_match', ocrRoutes)

app.get('/', (req, res) => {
    res.send('TrustSphere Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
