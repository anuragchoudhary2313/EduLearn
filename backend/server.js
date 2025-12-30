import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js'; 
import apiRoutes from './routes/api.js';

const app = express();

// --- CORS CONFIGURATION ---
// Setting origin to 'true' allows any domain to connect (Fixes the block)
app.use(cors({
    origin: true, 
    credentials: true 
}));
// --------------------------

app.use(express.json());
app.use(cookieParser());

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => { 
    console.error('❌ MongoDB connection error:', err.message); 
    console.log('💡 Checking connection string...');
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('Please check:');
    console.log('1. Your internet connection');
    console.log('2. MongoDB Atlas cluster is running');
    console.log('3. Your IP address is whitelisted in MongoDB Atlas');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server started on ${PORT}`));