export const CATEGORIES = [
  { id: 'tops',        label: 'Tops',                emoji: '👚', stack: 50 },
  { id: 'bottoms',     label: 'Bottoms',             emoji: '👖', stack: 30 },
  { id: 'dresses',     label: 'Dresses & Jumpsuits', emoji: '👗', stack: 45 },
  { id: 'shoes',       label: 'Shoes',               emoji: '👠', stack: 10 },
  { id: 'bags',        label: 'Bags & Accessories',  emoji: '👜', stack: 35 },
  { id: 'hats',        label: 'Hats',                emoji: '🎩', stack: 90 },
  { id: 'sunglasses',  label: 'Sunglasses',          emoji: '🕶️', stack: 80 },
  { id: 'outerwear',   label: 'Outerwear',           emoji: '🧥', stack: 55 },
  { id: 'activewear',  label: 'Activewear',          emoji: '🩱', stack: 40 }
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function categoryLabel(id) {
  return CATEGORY_BY_ID[id]?.label || id;
}

export function stackOrder(item) {
  return CATEGORY_BY_ID[item.category]?.stack ?? 50;
}
