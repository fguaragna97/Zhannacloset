import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '..', 'db.json');

const DEFAULT_DB = { mannequin: null, items: [], outfits: [] };

let writeQueue = Promise.resolve();

export async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DB, ...parsed };
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
      return { ...DEFAULT_DB };
    }
    throw err;
  }
}

async function atomicWrite(data) {
  const tmp = `${DB_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, DB_PATH);
}

export function updateDb(mutator) {
  const next = writeQueue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    await atomicWrite(db);
    return result;
  });
  writeQueue = next.catch(() => {});
  return next;
}
