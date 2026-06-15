import { CATEGORIES } from '../lib/categories.js';

export function CategoryTabs({ value, onChange, includeAll = true, counts }) {
  const tabs = includeAll
    ? [{ id: 'all', label: 'All', emoji: '✦' }, ...CATEGORIES]
    : CATEGORIES;

  return (
    <div className="-mx-4 md:mx-0">
      <div className="flex gap-2 overflow-x-auto px-4 md:px-0 pb-1 scrollbar-hidden">
        {tabs.map((tab) => {
          const active = (value || 'all') === tab.id;
          const count = counts?.[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id === 'all' ? null : tab.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                active
                  ? 'bg-ink text-bg border-ink shadow-soft'
                  : 'bg-bg text-ink/70 border-ink/10 hover:border-ink/30 hover:text-ink'
              }`}
            >
              <span aria-hidden>{tab.emoji}</span>
              <span className="font-medium">{tab.label}</span>
              {typeof count === 'number' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-bg/20' : 'bg-ink/5'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
