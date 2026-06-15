import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, CATEGORY_BY_ID } from '../lib/categories.js';
import { WebcamCapture } from './WebcamCapture.jsx';

export function AddItemModal({ open, onClose, onSubmit, defaultCategory }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(defaultCategory || null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState(null); // 'file' | 'webcam'
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setStep(defaultCategory ? 2 : 1);
    setCategory(defaultCategory || null);
    setFile(null);
    setPreviewUrl((url) => { if (url) URL.revokeObjectURL(url); return null; });
    setLabel('');
    setMode(null);
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultCategory]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  if (!open) return null;

  function handleFileChosen(f) {
    if (!f) return;
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    setStep(3);
  }

  async function handleSave() {
    if (!file || !category) return;
    setSubmitting(true);
    try {
      await onSubmit({ file, category, label: label.trim() });
      onClose();
    } catch (err) {
      setSubmitting(false);
      alert(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in"
        onClick={() => !submitting && onClose()}
      />
      <div className="relative bg-bg w-full md:w-[560px] md:max-w-[92vw] md:rounded-3xl rounded-t-3xl shadow-lift max-h-[92vh] overflow-y-auto animate-slide-up">
        <header className="sticky top-0 bg-bg/95 backdrop-blur z-10 px-6 pt-6 pb-3 flex items-center justify-between border-b border-ink/5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-taupe-600">Add to closet</p>
            <h2 className="font-display text-2xl text-ink">{stepTitle(step)}</h2>
          </div>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-ink/5 inline-flex items-center justify-center text-ink/70"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </header>

        <div className="px-6 py-6">
          {step === 1 && (
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCategory(c.id); setStep(2); }}
                  className="aspect-square rounded-2xl bg-white border border-ink/5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all p-3 flex flex-col items-center justify-center gap-2 text-center"
                >
                  <span className="text-3xl" aria-hidden>{c.emoji}</span>
                  <span className="text-xs font-medium text-ink/80 leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-ink/60">
                Adding to <span className="font-medium text-ink">{CATEGORY_BY_ID[category]?.label}</span>
              </p>

              {!mode && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/3] rounded-2xl border border-ink/10 bg-white shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all p-5 flex flex-col items-center justify-center gap-2"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="font-medium">Upload</span>
                    <span className="text-xs text-ink/50">From your device</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('webcam')}
                    className="aspect-[4/3] rounded-2xl border border-ink/10 bg-white shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all p-5 flex flex-col items-center justify-center gap-2"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 8h3l2-3h6l2 3h3v11H4V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.6" /></svg>
                    <span className="font-medium">Webcam</span>
                    <span className="text-xs text-ink/50">Snap it now</span>
                  </button>
                </div>
              )}

              {mode === 'webcam' && (
                <WebcamCapture
                  onCapture={(f) => { setMode(null); handleFileChosen(f); }}
                  onCancel={() => setMode(null)}
                />
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChosen(e.target.files?.[0])}
              />

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-ink/60 hover:text-ink underline-offset-4 hover:underline"
              >
                ← change category
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-2xl overflow-hidden border border-ink/5 bg-white">
                <div className="aspect-[4/5] bg-blush-50">
                  {previewUrl && <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.18em] text-taupe-600 mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={defaultLabel(category)}
                  className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink transition-colors"
                />
                <p className="text-xs text-ink/40 mt-1.5">Optional — we'll use a sensible default if blank.</p>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm text-ink/60 hover:text-ink underline-offset-4 hover:underline"
                  disabled={submitting}
                >
                  ← retake
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="px-7 py-3 rounded-full bg-ink text-bg disabled:opacity-50 hover:scale-[1.02] transition-transform font-medium"
                >
                  {submitting ? 'Saving…' : 'Save to closet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function stepTitle(s) {
  if (s === 1) return 'Choose a category';
  if (s === 2) return 'Add a photo';
  return 'Review & save';
}

function defaultLabel(category) {
  return CATEGORY_BY_ID[category]?.label || 'Item';
}
