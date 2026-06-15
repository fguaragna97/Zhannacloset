import { useRef, useState } from 'react';
import { assetUrl } from '../lib/api.js';
import { categoryLabel } from '../lib/categories.js';

export function DraggableList({ items, onReorder, onRemove }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const rowHeight = useRef(64);

  function onPointerDown(e, index) {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragIndex(index);
    setHoverIndex(index);
    startY.current = e.clientY;
    const row = containerRef.current?.children?.[index];
    if (row) rowHeight.current = row.getBoundingClientRect().height + 8;
  }

  function onPointerMove(e) {
    if (dragIndex === null) return;
    const delta = e.clientY - startY.current;
    const offset = Math.round(delta / rowHeight.current);
    const target = Math.max(0, Math.min(items.length - 1, dragIndex + offset));
    if (target !== hoverIndex) setHoverIndex(target);
  }

  function onPointerUp() {
    if (dragIndex !== null && hoverIndex !== null && dragIndex !== hoverIndex) {
      onReorder(dragIndex, hoverIndex);
    }
    setDragIndex(null);
    setHoverIndex(null);
  }

  if (items.length === 0) return null;

  return (
    <ul ref={containerRef} className="space-y-2 select-none" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      {items.map((item, idx) => {
        const isDragging = idx === dragIndex;
        const isHover = idx === hoverIndex && dragIndex !== null && idx !== dragIndex;
        return (
          <li
            key={item.id}
            className={`flex items-center gap-3 p-2.5 rounded-xl border bg-white transition-all ${
              isDragging ? 'opacity-50 border-ink/30' : isHover ? 'border-ink/40 shadow-soft' : 'border-ink/5'
            }`}
          >
            <button
              type="button"
              onPointerDown={(e) => onPointerDown(e, idx)}
              aria-label="Drag to reorder"
              className="touch-none cursor-grab active:cursor-grabbing text-ink/30 hover:text-ink/70 px-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="15" cy="18" r="1.4" /></svg>
            </button>
            <img
              src={assetUrl(item.thumbnailPath || item.imagePath)}
              alt=""
              className="w-12 h-14 object-cover rounded-lg bg-blush-50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.16em] text-taupe-600 truncate">
                {categoryLabel(item.category)}
              </p>
              <p className="text-sm font-medium truncate">{item.label}</p>
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label="Remove from outfit"
                className="w-8 h-8 rounded-full hover:bg-blush-100 inline-flex items-center justify-center text-ink/50 hover:text-ink"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
