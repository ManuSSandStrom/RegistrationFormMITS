import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import './db.js';
import { ensureAdmin } from './seedAdmin.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import adminRoutes from './routes/admin.js';
import { auth } from './middleware/auth.js';

const app = express();

// CORS
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({ origin: origins, credentials: true }));

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Static for uploaded files
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.get('/', (_req, res) => res.json({ ok: true }));
ensureAdmin().catch(console.error);

// Provide /api/me for frontend boot
app.get('/api/me', auth, async (req, res) => {
  const { default: getProfile } = await import('./routes/_getMe.js');
  return getProfile(req, res);
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;