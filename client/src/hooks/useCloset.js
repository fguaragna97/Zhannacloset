import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export function useCloset() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listItems();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async ({ file, category, label }) => {
    const created = await api.uploadItem({ file, category, label });
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const removeItem = useCallback(async (id) => {
    await api.deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { items, loading, error, refresh, addItem, removeItem };
}
