import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import locationRoutes from './routes/locationRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { swaggerSpec } from './swagger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    urls: [
      { url: '/swagger.json', name: 'FamMap API' }
    ],
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  }
}));

app.get('/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/locations', locationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'FamMap API is running' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export default app;