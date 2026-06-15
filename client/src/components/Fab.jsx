export function Fab({ onClick, label = 'Add item' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 inline-flex items-center gap-2 rounded-full bg-ink text-bg pl-5 pr-6 py-4 shadow-lift hover:scale-[1.03] active:scale-100 transition-transform"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-sm font-medium tracking-wide">{label}</span>
    </button>
  );
}
