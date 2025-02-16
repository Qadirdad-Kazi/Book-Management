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

// Routes
app.use('/api/books', booksRoute);
app.use('/api/auth', authRoute);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Book Management API is running',
    cors: {
      origin: corsOptions.origin,
      frontend_url: process.env.FRONTEND_URL
    }
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API is working',
    cors: {
      origin: corsOptions.origin,
      frontend_url: process.env.FRONTEND_URL
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection
const mongoDBURL = process.env.MONGODB_URI;

if (mongoDBURL) {
  mongoose
    .connect(mongoDBURL)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
    });
}

// Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5555;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
