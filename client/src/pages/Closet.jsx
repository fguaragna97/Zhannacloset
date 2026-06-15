import { useMemo, useState } from 'react';
import { useCloset } from '../hooks/useCloset.js';
import { CategoryTabs } from '../components/CategoryTabs.jsx';
import { ItemCard } from '../components/ItemCard.jsx';
import { Fab } from '../components/Fab.jsx';
import { AddItemModal } from '../components/AddItemModal.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';
import { CATEGORIES, CATEGORY_BY_ID } from '../lib/categories.js';

export function Closet() {
  const { items, loading, addItem, removeItem } = useCloset();
  const [filter, setFilter] = useState(null);
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  const counts = useMemo(() => {
    const c = { all: items.length };
    for (const cat of CATEGORIES) c[cat.id] = 0;
    for (const i of items) c[i.category] = (c[i.category] || 0) + 1;
    return c;
  }, [items]);

  const filtered = filter ? items.filter((i) => i.category === filter) : items;

  async function handleAdd(payload) {
    await addItem(payload);
    toast.push('Item added to closet');
  }

  async function handleDelete(item) {
    if (!confirm(`Remove "${item.label}"?`)) return;
    try {
      await removeItem(item.id);
      toast.push('Item removed');
    } catch (err) {
      toast.push(err.message, { tone: 'error' });
    }
  }

  return (
    <div className="px-4 md:px-8 pb-32 max-w-7xl mx-auto">
      <header className="pt-8 md:pt-12 pb-6 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-taupe-600">My Closet</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink mt-2">
            {filter ? CATEGORY_BY_ID[filter]?.label : 'Everything'}
          </h1>
          <p className="text-ink/50 mt-1">{counts[filter || 'all']} {counts[filter || 'all'] === 1 ? 'piece' : 'pieces'}</p>
        </div>
      </header>

      <CategoryTabs value={filter} onChange={setFilter} counts={counts} />

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji={filter ? CATEGORY_BY_ID[filter]?.emoji : '🪞'}
            title={filter ? `No ${CATEGORY_BY_ID[filter]?.label.toLowerCase()} yet` : 'Your closet is empty'}
            hint={filter ? "Add a piece in this category and it'll show here." : 'Tap the button to add your first item — upload a photo or snap one with your camera.'}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <Fab onClick={() => setAdding(true)} label="Add piece" />

      <AddItemModal
        open={adding}
        onClose={() => setAdding(false)}
        onSubmit={handleAdd}
        defaultCategory={filter}
      />
    </div>
  );
}
