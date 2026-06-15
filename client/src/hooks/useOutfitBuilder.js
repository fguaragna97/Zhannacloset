import { useCallback, useEffect, useMemo, useState } from 'react';
import { stackOrder } from '../lib/categories.js';

function defaultOrder(itemsById, ids) {
  return [...ids].sort((a, b) => {
    const ia = itemsById[a];
    const ib = itemsById[b];
    if (!ia || !ib) return 0;
    return stackOrder(ib) - stackOrder(ia);
  });
}

export function useOutfitBuilder(allItems) {
  const itemsById = useMemo(
    () => Object.fromEntries(allItems.map((i) => [i.id, i])),
    [allItems]
  );

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [order, setOrder] = useState([]);

  const selected = useMemo(() => order.map((id) => itemsById[id]).filter(Boolean), [order, itemsById]);

  useEffect(() => {
    setOrder((prev) => prev.filter((id) => itemsById[id]));
  }, [itemsById]);

  const toggle = useCallback((id) => {
    setOrder((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const next = [...prev, id];
      return defaultOrder(itemsById, next);
    });
  }, [itemsById]);

  const reorder = useCallback((from, to) => {
    setOrder((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const next = prev.slice();
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setOrder([]);
    setName('');
    setEditingId(null);
  }, []);

  const loadOutfit = useCallback((outfit) => {
    setEditingId(outfit.id);
    setName(outfit.name);
    setOrder(outfit.items.filter((id) => itemsById[id]));
  }, [itemsById]);

  return {
    editingId,
    name,
    setName,
    order,
    selected,
    toggle,
    reorder,
    reset,
    loadOutfit,
    isSelected: (id) => order.includes(id)
  };
}
