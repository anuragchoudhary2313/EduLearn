import jwt from 'jsonwebtoken';

// Use defaults if env vars are missing to prevent crashes
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

// ✅ Use 'export const' for named exports
export const signAccess = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' });
};

export const signRefresh = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' });
};

export const verifyAccess = (token) => jwt.verify(token, ACCESS_SECRET);
export const verifyRefresh = (token) => jwt.verify(token, REFRESH_SECRET);