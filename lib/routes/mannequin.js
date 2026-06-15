import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';

import { readDb, updateDb, saveImage, deleteAsset } from '../storage.js';

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
    const buffer = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toBuffer();

    const mannequinPath = await saveImage({
      folder: 'mannequin', id, ext: 'jpg',
      buffer, contentType: 'image/jpeg'
    });

    let previous = null;
    await updateDb(async (db) => {
      previous = db.mannequin;
      db.mannequin = mannequinPath;
    });
    if (previous) await deleteAsset(previous);

    res.status(201).json({ mannequin: mannequinPath });
  } catch (err) { next(err); }
});

router.delete('/', async (_req, res, next) => {
  try {
    let previous = null;
    await updateDb(async (db) => {
      previous = db.mannequin;
      db.mannequin = null;
    });
    if (previous) await deleteAsset(previous);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
