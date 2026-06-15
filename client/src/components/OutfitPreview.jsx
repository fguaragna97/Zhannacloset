import { assetUrl } from '../lib/api.js';
import { DefaultSilhouette } from './MannequinSetup.jsx';

export function OutfitPreview({ items, mannequin }) {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-blush-50 aspect-[3/4] shadow-soft border border-ink/5">
      {/* Mannequin underlay */}
      <div className="absolute inset-0">
        {mannequin ? (
          <img
            src={assetUrl(mannequin)}
            alt=""
            className="w-full h-full object-cover opacity-30"
            style={{ mixBlendMode: 'multiply' }}
          />
        ) : (
          <DefaultSilhouette />
        )}
      </div>

      {/* Decorative grain */}
      <div className="absolute inset-0 grain opacity-40 pointer-events-none" />

      {items.length === 0 ? (
        <div className="relative z-10 h-full flex items-center justify-center p-6 text-center">
          <p className="font-display italic text-ink/50 text-lg max-w-[14ch] text-balance">
            Select pieces to compose a look
          </p>
        </div>
      ) : (
        <div className="absolute inset-0 z-10 p-5 grid grid-rows-[auto_1fr_auto] gap-3">
          {/* Top row: hat / sunglasses */}
          <div className="flex items-start gap-3 justify-center min-h-[1px]">
            {items.filter((i) => i.category === 'hats' || i.category === 'sunglasses').map((i) => (
              <FloatingItem key={i.id} item={i} size="sm" />
            ))}
          </div>

          {/* Middle: top + bottom torso layers */}
          <div className="relative flex flex-col items-center justify-center gap-2">
            {items.filter((i) => ['outerwear','tops','dresses','activewear','bottoms'].includes(i.category)).map((i) => (
              <FloatingItem key={i.id} item={i} size={i.category === 'dresses' || i.category === 'outerwear' ? 'lg' : 'md'} />
            ))}

            {/* Bag floats top-right */}
            {items.filter((i) => i.category === 'bags').map((i, idx) => (
              <div key={i.id} className="absolute right-0 top-2" style={{ transform: `translateY(${idx * 12}px)` }}>
                <FloatingItem item={i} size="sm" />
              </div>
            ))}
          </div>

          {/* Bottom row: shoes */}
          <div className="flex items-end justify-center gap-3 min-h-[1px]">
            {items.filter((i) => i.category === 'shoes').map((i) => (
              <FloatingItem key={i.id} item={i} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FloatingItem({ item, size = 'md' }) {
  const dim = size === 'sm' ? 'w-20 h-20' : size === 'lg' ? 'w-44 h-52' : 'w-36 h-40';
  return (
    <div className={`${dim} rounded-2xl bg-white/80 backdrop-blur-sm border border-ink/5 shadow-lift overflow-hidden animate-fade-in`}>
      <img
        src={assetUrl(item.thumbnailPath || item.imagePath)}
        alt={item.label}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
