export function EmptyState({ title, hint, emoji = '🪞', action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-blush-50 flex items-center justify-center text-4xl mb-6 shadow-soft">
        {emoji}
      </div>
      <h3 className="font-display text-2xl text-ink mb-2 text-balance">{title}</h3>
      {hint && <p className="text-ink/60 max-w-sm text-balance">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
