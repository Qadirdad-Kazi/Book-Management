import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5555;
export const mongoDBURL = process.env.MONGODB_URL || 'mongodb+srv://Cgpa:Cgpa123@cluster0.nxvhp.mongodb.net/bookmanagement?retryWrites=true&w=majority';
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
