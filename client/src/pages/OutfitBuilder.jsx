import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCloset } from '../hooks/useCloset.js';
import { useOutfitBuilder } from '../hooks/useOutfitBuilder.js';
import { CategoryTabs } from '../components/CategoryTabs.jsx';
import { ItemCard } from '../components/ItemCard.jsx';
import { OutfitPreview } from '../components/OutfitPreview.jsx';
import { DraggableList } from '../components/DraggableList.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';
import { api } from '../lib/api.js';

export function OutfitBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, loading } = useCloset();
  const builder = useOutfitBuilder(items);
  const toast = useToast();

  const [filter, setFilter] = useState(null);
  const [mannequin, setMannequin] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getMannequin().then((res) => setMannequin(res.mannequin)).catch(() => {});
  }, []);

  // Hydrate from navigation state (when editing an existing outfit)
  useEffect(() => {
    if (location.state?.outfit && items.length > 0) {
      builder.loadOutfit(location.state.outfit);
      // Clear the state so refresh doesn't reapply
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, items]);

  const filtered = filter ? items.filter((i) => i.category === filter) : items;

  async function handleSave() {
    if (builder.order.length === 0) {
      toast.push('Pick at least one piece', { tone: 'error' });
      return;
    }
    const fallback = `Look ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    const name = (builder.name || '').trim() || fallback;
    setSaving(true);
    try {
      if (builder.editingId) {
        await api.updateOutfit(builder.editingId, { name, items: builder.order });
        toast.push('Outfit updated');
      } else {
        await api.saveOutfit({ name, items: builder.order });
        toast.push('Outfit saved');
      }
      builder.reset();
      navigate('/saved');
    } catch (err) {
      toast.push(err.message, { tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const counts = useMemo(() => {
    const c = { all: items.length };
    for (const i of items) c[i.category] = (c[i.category] || 0) + 1;
    return c;
  }, [items]);

  return (
    <div className="px-4 md:px-8 pb-32 max-w-7xl mx-auto">
      <header className="pt-8 md:pt-12 pb-6 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-taupe-600">Studio</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink mt-2">
            {builder.editingId ? 'Edit outfit' : 'Build a look'}
          </h1>
          <p className="text-ink/50 mt-1">Pick pieces from your closet — we'll layer them over your mannequin.</p>
        </div>

        <div className="flex items-center gap-2">
          {builder.order.length > 0 && (
            <button
              type="button"
              onClick={builder.reset}
              className="text-sm px-4 py-2 rounded-full border border-ink/15 text-ink/70 hover:text-ink hover:border-ink/40 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || builder.order.length === 0}
            className="px-6 py-3 rounded-full bg-ink text-bg disabled:opacity-40 hover:scale-[1.02] transition-transform font-medium"
          >
            {saving ? 'Saving…' : builder.editingId ? 'Update outfit' : 'Save outfit'}
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        {/* Closet picker */}
        <section className="rounded-3xl bg-white/60 border border-ink/5 p-4 md:p-6">
          <CategoryTabs value={filter} onChange={setFilter} counts={counts} />

          <div className="mt-5">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-2xl bg-bg animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                emoji="🧺"
                title="Nothing to pick from"
                hint="Add some clothes to your closet first."
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filtered.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selectable
                    selected={builder.isSelected(item.id)}
                    onClick={() => builder.toggle(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Preview + arrangement */}
        <aside className="space-y-5">
          <div className="lg:sticky lg:top-6 space-y-5">
            <OutfitPreview items={builder.selected} mannequin={mannequin} />

            <input
              type="text"
              value={builder.name}
              onChange={(e) => builder.setName(e.target.value)}
              placeholder="Name this look"
              className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink transition-colors"
            />

            {builder.selected.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-taupe-600">Stack order</p>
                  <span className="text-xs text-ink/40">drag to reorder</span>
                </div>
                <DraggableList
                  items={builder.selected}
                  onReorder={builder.reorder}
                  onRemove={(id) => builder.toggle(id)}
                />
              </div>
            ) : (
              <p className="text-sm text-ink/40 italic text-center py-6">
                No pieces selected yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
