import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { MannequinSetup } from '../components/MannequinSetup.jsx';

export function Settings() {
  const [mannequin, setMannequin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMannequin()
      .then((res) => setMannequin(res.mannequin))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 md:px-8 pb-32 max-w-3xl mx-auto">
      <header className="pt-8 md:pt-12 pb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-taupe-600">Settings</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mt-2">Make it yours</h1>
      </header>

      {loading ? (
        <div className="h-72 rounded-3xl bg-white/60 animate-pulse" />
      ) : (
        <MannequinSetup mannequin={mannequin} onUpdated={setMannequin} />
      )}

      <section className="mt-8 rounded-3xl bg-white/60 border border-ink/5 p-6">
        <h2 className="font-display text-xl text-ink">About</h2>
        <p className="text-ink/60 mt-2 text-sm leading-relaxed">
          My Closet stores everything locally — your photos live in this project's <code className="text-xs px-1.5 py-0.5 rounded bg-ink/5">uploads/</code> folder
          and your wardrobe data lives in <code className="text-xs px-1.5 py-0.5 rounded bg-ink/5">db.json</code>. Nothing leaves your machine.
        </p>
      </section>
    </div>
  );
}
