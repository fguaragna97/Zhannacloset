async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Mannequin
  getMannequin: () => fetch('/api/mannequin').then(handle),
  uploadMannequin: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return fetch('/api/mannequin', { method: 'POST', body: fd }).then(handle);
  },
  clearMannequin: () => fetch('/api/mannequin', { method: 'DELETE' }).then(handle),

  // Items
  listItems: (category) => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return fetch(`/api/items${qs}`).then(handle);
  },
  uploadItem: ({ file, category, label }) => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('category', category);
    if (label) fd.append('label', label);
    return fetch('/api/items', { method: 'POST', body: fd }).then(handle);
  },
  deleteItem: (id) => fetch(`/api/items/${id}`, { method: 'DELETE' }).then(handle),

  // Outfits
  listOutfits: () => fetch('/api/outfits').then(handle),
  saveOutfit: ({ name, items }) =>
    fetch('/api/outfits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, items })
    }).then(handle),
  updateOutfit: (id, payload) =>
    fetch(`/api/outfits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),
  deleteOutfit: (id) => fetch(`/api/outfits/${id}`, { method: 'DELETE' }).then(handle)
};

export function assetUrl(p) {
  if (!p) return '';
  if (/^https?:/.test(p)) return p;
  return p.startsWith('/') ? p : `/${p}`;
}

export async function downsizeImage(file, { maxDim = 1600, quality = 0.88 } = {}) {
  if (!file) return file;
  const bitmap = await loadBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  if (typeof bitmap.close === 'function') bitmap.close();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('canvas encode failed')), 'image/jpeg', quality);
  });
  const baseName = file.name?.replace(/\.[^./\\]+$/, '') || 'image';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file); } catch {}
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image decode failed')); };
    img.src = url;
  });
}
