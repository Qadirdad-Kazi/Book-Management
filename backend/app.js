import express from 'express';
import cors from 'cors';
import booksRoute from './routes/booksRoute.js';
import authRoute from './routes/authRoute.js';

const app = express();

// Middleware for parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`${req.method} ${req.path}`, req.body);
    }
    next();
});

// Middleware for handling CORS POLICY
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to Book Management API", status: "healthy" });
});

// Routes
app.use("/api/books", booksRoute);
app.use("/api/auth", authRoute);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;
