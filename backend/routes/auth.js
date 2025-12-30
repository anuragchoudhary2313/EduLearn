import express from 'express';
import bcrypt from 'bcryptjs'; 
import User from '../models/User.js'; // ✅ REMOVED { } - Now matches 'export default'
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js'; 

const router = express.Router();
const SALT_ROUNDS = 10;

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role='student', full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, password_hash: hash, role, full_name });
    
    const access = signAccess({ sub: user._id, email: user.email });
    const refresh = signRefresh({ sub: user._id, email: user.email });

    user.refresh_tokens.push({ token: refresh, issued_at: new Date() });
    await user.save();

    res.json({ accessToken: access, refreshToken: refresh, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    
    const access = signAccess({ sub: user._id, email: user.email });
    const refresh = signRefresh({ sub: user._id, email: user.email });

    user.refresh_tokens.push({ token: refresh, issued_at: new Date() });
    await user.save();

    res.json({ accessToken: access, refreshToken: refresh, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    
    const payload = verifyRefresh(refreshToken);
    const user = await User.findById(payload.sub);
    
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    const found = (user.refresh_tokens || []).find(rt => rt.token === refreshToken);
    if (!found) return res.status(401).json({ error: 'Token reused or invalid' });

    const access = signAccess({ sub: user._id, email: user.email });
    res.json({ accessToken: access });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const payload = verifyRefresh(refreshToken);
      const user = await User.findById(payload.sub);
      if (user) {
        user.refresh_tokens = user.refresh_tokens.filter(rt => rt.token !== refreshToken);
        await user.save();
      }
    }
    res.json({ ok: true });
  } catch (e) { res.json({ ok: true }); }
});

export default router;