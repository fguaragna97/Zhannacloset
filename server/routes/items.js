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
const ITEMS_DIR = path.join(ROOT, 'uploads', 'items');
const THUMBS_DIR = path.join(ROOT, 'uploads', 'thumbs');

const VALID_CATEGORIES = new Set([
  'tops', 'bottoms', 'dresses', 'shoes', 'bags', 'hats', 'sunglasses', 'outerwear', 'activewear'
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }
});

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const db = await readDb();
    const { category } = req.query;
    const items = category ? db.items.filter((i) => i.category === category) : db.items;
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image is required' });
    const category = String(req.body.category || '').toLowerCase();
    if (!VALID_CATEGORIES.has(category)) {
      return res.status(400).json({ error: 'invalid category' });
    }
    const label = (req.body.label && String(req.body.label).trim()) || defaultLabel(category);

    const id = uuid();
    const ext = pickExt(req.file.mimetype);
    const imageRel = path.posix.join('uploads', 'items', `${id}.${ext}`);
    const thumbRel = path.posix.join('uploads', 'thumbs', `${id}.jpg`);
    const imageAbs = path.join(ROOT, imageRel);
    const thumbAbs = path.join(ROOT, thumbRel);

    await fs.writeFile(imageAbs, req.file.buffer);
    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 600, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(thumbAbs);

    const item = {
      id,
      category,
      label,
      imagePath: imageRel,
      thumbnailPath: thumbRel,
      createdAt: new Date().toISOString()
    };

    await updateDb(async (db) => { db.items.unshift(item); });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    let removed = null;
    await updateDb(async (db) => {
      const idx = db.items.findIndex((i) => i.id === id);
      if (idx === -1) return;
      removed = db.items[idx];
      db.items.splice(idx, 1);
      db.outfits = db.outfits.map((o) => ({
        ...o,
        items: o.items.filter((iid) => iid !== id)
      }));
    });
    if (removed) {
      await safeUnlink(path.join(ROOT, removed.imagePath));
      await safeUnlink(path.join(ROOT, removed.thumbnailPath));
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

function defaultLabel(category) {
  const map = {
    tops: 'Top',
    bottoms: 'Bottom',
    dresses: 'Dress',
    shoes: 'Shoes',
    bags: 'Bag',
    hats: 'Hat',
    sunglasses: 'Sunglasses',
    outerwear: 'Outerwear',
    activewear: 'Activewear piece'
  };
  return map[category] || 'Item';
}

function pickExt(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/heic' || mime === 'image/heif') return 'heic';
  return 'jpg';
}

async function safeUnlink(p) {
  try { await fs.unlink(p); } catch (err) { if (err.code !== 'ENOENT') console.warn('unlink', p, err.message); }
}

export default router;
