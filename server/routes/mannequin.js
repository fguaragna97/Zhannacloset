import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { readDb, updateDb } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const MANNEQUIN_DIR = path.join(ROOT, 'uploads', 'mannequin');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json({ mannequin: db.mannequin });
  } catch (err) { next(err); }
});

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image is required' });

    const id = uuid();
    const rel = path.posix.join('uploads', 'mannequin', `${id}.jpg`);
    const abs = path.join(ROOT, rel);

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toFile(abs);

    let previous = null;
    await updateDb(async (db) => {
      previous = db.mannequin;
      db.mannequin = rel;
    });

    if (previous) {
      const prevAbs = path.join(ROOT, previous);
      try { await fs.unlink(prevAbs); } catch (err) { if (err.code !== 'ENOENT') console.warn(err.message); }
    }

    res.status(201).json({ mannequin: rel });
  } catch (err) { next(err); }
});

router.delete('/', async (_req, res, next) => {
  try {
    let previous = null;
    await updateDb(async (db) => {
      previous = db.mannequin;
      db.mannequin = null;
    });
    if (previous) {
      try { await fs.unlink(path.join(ROOT, previous)); } catch {}
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
