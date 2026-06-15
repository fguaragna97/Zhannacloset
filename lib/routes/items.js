import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';

import { readDb, updateDb, saveImage, deleteAsset } from '../storage.js';

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
    res.json(category ? db.items.filter((i) => i.category === category) : db.items);
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

    const imagePath = await saveImage({
      folder: 'items', id, ext,
      buffer: req.file.buffer,
      contentType: req.file.mimetype
    });

    const thumbBuffer = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 600, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
    const thumbnailPath = await saveImage({
      folder: 'thumbs', id, ext: 'jpg',
      buffer: thumbBuffer,
      contentType: 'image/jpeg'
    });

    const item = {
      id,
      category,
      label,
      imagePath,
      thumbnailPath,
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
      await deleteAsset(removed.imagePath);
      await deleteAsset(removed.thumbnailPath);
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
  return 'jpg';
}

export default router;
