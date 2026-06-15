export function Fab({ onClick, label = 'Add item' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-4 md:bottom-8 md:right-8 z-40 inline-flex items-center justify-center gap-2 rounded-full bg-ink text-bg shadow-lift hover:scale-[1.03] active:scale-100 transition-transform h-14 w-14 md:h-auto md:w-auto md:pl-5 md:pr-6 md:py-4"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="hidden md:inline text-sm font-medium tracking-wide">{label}</span>
    </button>
  );
}
