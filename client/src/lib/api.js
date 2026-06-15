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
