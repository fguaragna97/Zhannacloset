'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ENV_PATH = path.resolve(__dirname, '..', '.env.local');
if (!fs.existsSync(ENV_PATH)) return;

try {
  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
} catch (err) {
  console.warn('[load-env] failed:', err.message);
}
