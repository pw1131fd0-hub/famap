import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
// @ts-ignore - swagger-ui-express missing type declarations
import swaggerUi from 'swagger-ui-express';
import locationRoutes from './routes/locationRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { swaggerSpec } from './swagger.js';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

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
  res.json({ status: 'ok', message: 'FamMap API is running', timestamp: new Date().toISOString() });
});

let server: any = null;

if (process.env.NODE_ENV !== 'test') {
  // Start server with enhanced error handling and port conflict resolution
  const startServer = () => {
    try {
      server = app.listen(port, '0.0.0.0', () => {
        console.log(`✓ FamMap API server started at http://localhost:${port}`);
        console.log(`✓ Health check: http://localhost:${port}/health`);
        console.log(`✓ API Documentation: http://localhost:${port}/api-docs`);
      });

      // Handle server errors (port already in use, permission denied, etc.)
      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`✗ Error: Port ${port} is already in use`);
          console.error(`  - Close the process using port ${port} or set PORT environment variable`);
          console.error(`  - Example: PORT=3001 npm start`);
          process.exit(1);
        } else if (error.code === 'EACCES') {
          console.error(`✗ Error: Permission denied to bind to port ${port}`);
          console.error(`  - Use a port number >= 1024 or run with elevated privileges`);
          process.exit(1);
        } else {
          console.error(`✗ Server error: ${error.message}`);
          process.exit(1);
        }
      });
    } catch (error) {
      console.error(`✗ Failed to start server:`, error);
      process.exit(1);
    }
  };

  // Clean up on shutdown
  const gracefulShutdown = () => {
    console.log('\n✓ Shutting down server...');
    if (server) {
      server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.warn('⚠ Forcing shutdown');
        process.exit(0);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  startServer();
}

export default app;