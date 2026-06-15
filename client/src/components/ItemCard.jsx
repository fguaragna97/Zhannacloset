import { assetUrl } from '../lib/api.js';
import { categoryLabel } from '../lib/categories.js';

export function ItemCard({ item, onDelete, onClick, selected, selectable }) {
  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-white border transition-all cursor-pointer ${
        selected
          ? 'border-ink shadow-lift ring-2 ring-ink ring-offset-2 ring-offset-bg'
          : 'border-ink/5 shadow-soft hover:-translate-y-0.5 hover:shadow-lift'
      }`}
      onClick={onClick}
      role={selectable ? 'button' : undefined}
    >
      <div className="aspect-[4/5] bg-blush-50 overflow-hidden">
        <img
          src={assetUrl(item.thumbnailPath || item.imagePath)}
          alt={item.label}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-taupe-600 truncate">
            {categoryLabel(item.category)}
          </p>
          <p className="text-sm font-medium text-ink truncate">{item.label}</p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            aria-label="Delete item"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity w-8 h-8 rounded-full bg-bg hover:bg-blush-100 inline-flex items-center justify-center text-ink/60 hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      {selected && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-ink text-bg inline-flex items-center justify-center shadow-soft">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
