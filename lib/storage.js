import { put, del, list } from '@vercel/blob';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'db.json');

const DEFAULT_DB = { mannequin: null, items: [], outfits: [] };

export const isBlobMode = !!process.env.BLOB_READ_WRITE_TOKEN;

let writeQueue = Promise.resolve();

export async function readDb() {
  return isBlobMode ? readDbBlob() : readDbFs();
}

export function updateDb(mutator) {
  const next = writeQueue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    if (isBlobMode) await writeDbBlob(db);
    else await writeDbFs(db);
    return result;
  });
  writeQueue = next.catch(() => {});
  return next;
}

export async function saveImage({ folder, id, ext, buffer, contentType }) {
  const filename = `${folder}/${id}.${ext}`;
  if (isBlobMode) {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: contentType || guessMime(ext),
      addRandomSuffix: true
    });
    return blob.url;
  }
  const rel = path.posix.join('uploads', folder, `${id}.${ext}`);
  const abs = path.join(ROOT, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, buffer);
  return '/' + rel;
}

export async function deleteAsset(url) {
  if (!url) return;
  if (isBlobMode) {
    if (!/^https?:\/\//.test(url)) return;
    try { await del(url); } catch (err) { console.warn('blob delete failed', err.message); }
    return;
  }
  const rel = url.startsWith('/') ? url.slice(1) : url;
  if (/^https?:\/\//.test(rel)) return;
  try { await fs.unlink(path.join(ROOT, rel)); }
  catch (err) { if (err.code !== 'ENOENT') console.warn('fs delete failed', err.message); }
}

function guessMime(ext) {
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

// ---- FS implementation ----

async function readDbFs() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return { ...DEFAULT_DB, ...JSON.parse(raw) };
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
      return { ...DEFAULT_DB };
    }
    throw err;
  }
}

async function writeDbFs(data) {
  const tmp = `${DB_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, DB_PATH);
}

// ---- Blob implementation ----

// Vercel Blob's public-blob CDN cache has a 60s minimum, so we can't
// rely on a fixed db.json URL — every write creates a new versioned
// blob and we always read the most recent one via list().

async function readDbBlob() {
  const { blobs } = await list({ prefix: 'db-' });
  if (!blobs.length) return { ...DEFAULT_DB };
  const sorted = [...blobs].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  const latest = sorted[0];
  const res = await fetch(latest.url, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) return { ...DEFAULT_DB };
    throw new Error(`db blob read failed: ${res.status}`);
  }
  return { ...DEFAULT_DB, ...(await res.json()) };
}

async function writeDbBlob(data) {
  const result = await put(`db-${Date.now()}.json`, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'application/json'
  });
  // Prune older versions (best-effort).
  try {
    const { blobs } = await list({ prefix: 'db-' });
    const older = blobs
      .filter((b) => b.url !== result.url)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(1);
    if (older.length) {
      await del(older.map((b) => b.url));
    }
  } catch (err) {
    console.warn('db prune failed:', err.message);
  }
}
