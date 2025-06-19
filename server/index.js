import express from 'express';
import dotenv from "dotenv"
import cors from 'cors';
import reviewRoutes from './routes/review.js';
import imageRoutes from './routes/image.js';
import graphRoutes from './routes/graph.js';
import trustRoutes from './routes/trust.js';

dotenv.config({path: './.env'})

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/review/analyze', reviewRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/trust', trustRoutes);

app.get('/', (req, res) => {
    res.send('TrustSphere Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
