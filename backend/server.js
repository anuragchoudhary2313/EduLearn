import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js'; 
import apiRoutes from './routes/api.js';

const app = express();
const mongoUri = process.env.MONGODB_URI?.trim();
const normalizeUrl = (value) => value?.trim().replace(/\/+$/, '');
const frontendUrl = normalizeUrl(process.env.FRONTEND_URL);
const allowedOrigins = new Set([
  frontendUrl,
  normalizeUrl('http://localhost:5173'),
  normalizeUrl('https://edu-learn-coral.vercel.app')
].filter(Boolean));

// --- CORS CONFIGURATION ---
// Setting origin to 'true' allows any domain to connect (Fixes the block)
app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(normalizeUrl(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));
// --------------------------

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

if (!mongoUri) {
  console.error('❌ Missing MONGODB_URI environment variable.');
  console.error('Create a backend/.env file from backend/.env.example before starting the server.');
  process.exit(1);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => console.log(`🚀 Server started on ${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Checking connection string...');
    console.log('MongoDB URI exists:', !!mongoUri);
    console.log('Please check:');
    console.log('1. Your internet connection');
    console.log('2. MongoDB Atlas cluster is running');
    console.log('3. Your IP address is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
}

startServer();