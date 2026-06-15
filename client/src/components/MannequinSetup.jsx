import { useEffect, useRef, useState } from 'react';
import { api, assetUrl } from '../lib/api.js';
import { WebcamCapture } from './WebcamCapture.jsx';
import { useToast } from './Toast.jsx';

export function MannequinSetup({ mannequin, onUpdated }) {
  const [mode, setMode] = useState(null); // 'file' | 'webcam'
  const [busy, setBusy] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  function pickFile(file) {
    if (!file) return;
    setPreviewFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setMode(null);
  }

  async function save() {
    if (!previewFile) return;
    setBusy(true);
    try {
      const res = await api.uploadMannequin(previewFile);
      onUpdated(res.mannequin);
      setPreviewFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      toast.push('Mannequin updated');
    } catch (err) {
      toast.push(err.message, { tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    if (!confirm('Remove your mannequin photo?')) return;
    setBusy(true);
    try {
      await api.clearMannequin();
      onUpdated(null);
      toast.push('Mannequin removed');
    } catch (err) {
      toast.push(err.message, { tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white border border-ink/5 shadow-soft p-6 md:p-8">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-taupe-600">Personal mannequin</p>
          <h2 className="font-display text-3xl text-ink mt-1">Your mirror</h2>
          <p className="text-ink/60 max-w-md mt-2">
            Upload a full-body photo to style outfits over yourself. Replace anytime — we'll use a soft silhouette if you skip.
          </p>
        </div>

        <div className="w-44 h-56 rounded-2xl overflow-hidden bg-blush-50 border border-ink/5 shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
          ) : mannequin ? (
            <img src={assetUrl(mannequin)} alt="mannequin" className="w-full h-full object-cover" />
          ) : (
            <DefaultSilhouette />
          )}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border border-ink/10 hover:border-ink/30 px-5 py-4 text-left transition-colors"
        >
          <p className="font-medium">Upload a photo</p>
          <p className="text-xs text-ink/50 mt-1">From your device</p>
        </button>
        <button
          type="button"
          onClick={() => setMode('webcam')}
          className="rounded-2xl border border-ink/10 hover:border-ink/30 px-5 py-4 text-left transition-colors"
        >
          <p className="font-medium">Use webcam</p>
          <p className="text-xs text-ink/50 mt-1">Strike a pose</p>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0])}
      />

      {mode === 'webcam' && (
        <div className="mt-6">
          <WebcamCapture onCapture={pickFile} onCancel={() => setMode(null)} />
        </div>
      )}

      {previewFile && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="px-6 py-3 rounded-full bg-ink text-bg disabled:opacity-50 hover:scale-[1.02] transition-transform font-medium"
          >
            {busy ? 'Saving…' : 'Save mannequin'}
          </button>
          <button
            type="button"
            onClick={() => { setPreviewFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
            className="text-sm text-ink/60 hover:text-ink underline-offset-4 hover:underline"
          >
            Discard
          </button>
        </div>
      )}

      {mannequin && !previewFile && (
        <button
          type="button"
          onClick={clear}
          disabled={busy}
          className="mt-5 text-sm text-ink/50 hover:text-ink underline-offset-4 hover:underline"
        >
          Remove mannequin photo
        </button>
      )}
    </section>
  );
}

export function DefaultSilhouette({ className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 120 200" className={className} aria-hidden>
      <defs>
        <linearGradient id="silG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F0D9D0" />
          <stop offset="1" stopColor="#E5BFB1" />
        </linearGradient>
      </defs>
      <rect width="120" height="200" fill="#FBF4F1" />
      <g fill="url(#silG)">
        <circle cx="60" cy="32" r="16" />
        <path d="M40 56 Q60 50 80 56 L92 110 Q92 116 86 116 L78 116 L82 178 Q82 184 76 184 L66 184 L62 130 L58 130 L54 184 L44 184 Q38 184 38 178 L42 116 L34 116 Q28 116 28 110 Z" />
      </g>
    </svg>
  );
}
