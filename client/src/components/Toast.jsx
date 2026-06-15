import { createContext, useCallback, useContext, useState } from 'react';

const ToastCtx = createContext({ push: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, opts = {}) => {
    const id = crypto.randomUUID();
    const tone = opts.tone || 'default';
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, opts.duration ?? 2800);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed top-4 left-1/2 z-[100] -translate-x-1/2 flex flex-col gap-2 items-center">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-full px-5 py-2.5 text-sm font-medium shadow-soft animate-slide-up ${
              t.tone === 'error'
                ? 'bg-ink text-blush-50'
                : 'bg-ink text-bg'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
