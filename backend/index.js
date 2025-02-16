import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import booksRoute from './routes/booksRoute.js';
import authRoute from './routes/authRoute.js';

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://kazibookmanagement.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const mongoDBURL = process.env.MONGODB_URI;
    if (!mongoDBURL) {
      throw new Error('MONGODB_URI is not defined');
    }

    const client = await mongoose.connect(mongoDBURL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedDb = client;
    console.log('Connected to MongoDB');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Connect to MongoDB before handling routes
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection error' });
  }
});

// Routes
app.use('/api/books', booksRoute);
app.use('/api/auth', authRoute);

// Health check endpoint
app.get('/', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ 
      message: 'Book Management API is running',
      cors: {
        origin: corsOptions.origin,
        frontend_url: process.env.FRONTEND_URL
      },
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'API is running but database connection failed',
      error: error.message
    });
  }
});

app.get('/api', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ 
      message: 'API is working',
      cors: {
        origin: corsOptions.origin,
        frontend_url: process.env.FRONTEND_URL
      },
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'API is running but database connection failed',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5555;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
