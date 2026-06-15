import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, assetUrl } from '../lib/api.js';
import { useCloset } from '../hooks/useCloset.js';
import { EmptyState } from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';

export function SavedOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items } = useCloset();
  const navigate = useNavigate();
  const toast = useToast();

  const itemsById = Object.fromEntries(items.map((i) => [i.id, i]));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listOutfits();
      setOutfits(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openInBuilder(outfit) {
    navigate('/builder', { state: { outfit } });
  }

  async function remove(outfit, e) {
    e.stopPropagation();
    if (!confirm(`Delete "${outfit.name}"?`)) return;
    try {
      await api.deleteOutfit(outfit.id);
      setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
      toast.push('Outfit deleted');
    } catch (err) {
      toast.push(err.message, { tone: 'error' });
    }
  }

  return (
    <div className="px-4 md:px-8 pb-32 max-w-7xl mx-auto">
      <header className="pt-8 md:pt-12 pb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-taupe-600">Lookbook</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mt-2">Saved outfits</h1>
        <p className="text-ink/50 mt-1">{outfits.length} {outfits.length === 1 ? 'look' : 'looks'}</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl bg-white/60 animate-pulse" />
          ))}
        </div>
      ) : outfits.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="No looks yet"
          hint="Build outfits in the Studio to save them here."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {outfits.map((outfit) => (
            <article
              key={outfit.id}
              onClick={() => openInBuilder(outfit)}
              className="group relative rounded-3xl bg-white border border-ink/5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all overflow-hidden cursor-pointer"
            >
              <div className="aspect-[3/4] grid grid-cols-2 grid-rows-2 gap-px bg-blush-50">
                {fillCollage(outfit.items, itemsById).map((item, idx) => (
                  <div key={idx} className="bg-blush-50 overflow-hidden">
                    {item ? (
                      <img src={assetUrl(item.thumbnailPath || item.imagePath)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blush-50" />
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-ink truncate">{outfit.name}</h3>
                  <p className="text-xs text-ink/50 mt-0.5">
                    {outfit.items.length} pieces · {new Date(outfit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => remove(outfit, e)}
                  aria-label="Delete outfit"
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity w-8 h-8 rounded-full bg-bg hover:bg-blush-100 inline-flex items-center justify-center text-ink/60 hover:text-ink shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function fillCollage(itemIds, itemsById) {
  const found = itemIds.map((id) => itemsById[id]).filter(Boolean).slice(0, 4);
  while (found.length < 4) found.push(null);
  return found;
}
