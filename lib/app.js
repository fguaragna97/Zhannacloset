import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { isBlobMode } from './storage.js';
import itemsRouter from './routes/items.js';
import outfitsRouter from './routes/outfits.js';
import mannequinRouter from './routes/mannequin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const UPLOADS = path.join(ROOT, 'uploads');

if (!isBlobMode) {
  await fs.mkdir(path.join(UPLOADS, 'items'), { recursive: true });
  await fs.mkdir(path.join(UPLOADS, 'thumbs'), { recursive: true });
  await fs.mkdir(path.join(UPLOADS, 'mannequin'), { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

if (!isBlobMode) {
  app.use('/uploads', express.static(UPLOADS));
}

app.use('/api/items', itemsRouter);
app.use('/api/outfits', outfitsRouter);
app.use('/api/mannequin', mannequinRouter);

app.get('/api', (_req, res) => {
  res.json({ ok: true, mode: isBlobMode ? 'blob' : 'fs' });
});

app.use((err, _req, res, _next) => {
  console.error('[server error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

export default app;
