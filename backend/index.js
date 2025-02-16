import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import booksRoute from './routes/booksRoute.js';
import authRoute from './routes/authRoute.js';

dotenv.config();

const app = express();

// Verify required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://kazibookmanagement.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Options preflight
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB connection with retry logic
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

async function connectToDatabase() {
  while (connectionAttempts < MAX_RETRIES && !isConnected) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      isConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      connectionAttempts++;
      console.error(`MongoDB connection attempt ${connectionAttempts} failed:`, error.message);
      if (connectionAttempts < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  if (!isConnected) {
    console.error('Failed to connect to MongoDB after maximum retries');
    process.exit(1);
  }
}

// Connect to MongoDB before handling routes
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectToDatabase();
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: isConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/books', booksRoute);
app.use('/api/auth', authRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Book Management API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      books: '/api/books',
      auth: '/api/auth'
    }
  });
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.status(200).end();
});

// 404 handler for undefined routes
app.use((req, res) => {
  const error = {
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  };
  console.log('404 Error:', error);
  res.status(404).json(error);
});

// Error handler
app.use((err, req, res, next) => {
  const error = {
    message: err.message || 'Something went wrong!',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    error: process.env.NODE_ENV === 'development' ? err : {}
  };
  console.error('Server Error:', error);
  res.status(err.status || 500).json(error);
});

const PORT = process.env.PORT || 5555;

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
