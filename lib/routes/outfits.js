import express from 'express';
import { v4 as uuid } from 'uuid';

import { readDb, updateDb } from '../storage.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.outfits);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const itemIds = Array.isArray(req.body?.items) ? req.body.items.map(String) : [];
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (itemIds.length === 0) return res.status(400).json({ error: 'at least one item is required' });

    const db = await readDb();
    const known = new Set(db.items.map((i) => i.id));
    const filtered = itemIds.filter((id) => known.has(id));
    if (filtered.length === 0) return res.status(400).json({ error: 'no valid items' });

    const outfit = {
      id: uuid(),
      name,
      items: filtered,
      createdAt: new Date().toISOString()
    };

    await updateDb(async (db) => { db.outfits.unshift(outfit); });
    res.status(201).json(outfit);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    let updated = null;
    await updateDb(async (db) => {
      const outfit = db.outfits.find((o) => o.id === id);
      if (!outfit) return;
      if (typeof req.body?.name === 'string') {
        const trimmed = req.body.name.trim();
        if (trimmed) outfit.name = trimmed;
      }
      if (Array.isArray(req.body?.items)) {
        const known = new Set(db.items.map((i) => i.id));
        outfit.items = req.body.items.map(String).filter((iid) => known.has(iid));
      }
      updated = outfit;
    });
    if (!updated) return res.status(404).json({ error: 'not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    await updateDb(async (db) => {
      db.outfits = db.outfits.filter((o) => o.id !== id);
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
