export const CATEGORIES = [
  { id: 'tops',        label: 'Tops',                short: 'Tops',       emoji: '👚', stack: 50 },
  { id: 'bottoms',     label: 'Bottoms',             short: 'Bottoms',    emoji: '👖', stack: 30 },
  { id: 'dresses',     label: 'Dresses & Jumpsuits', short: 'Dresses',    emoji: '👗', stack: 45 },
  { id: 'shoes',       label: 'Shoes',               short: 'Shoes',      emoji: '👠', stack: 10 },
  { id: 'bags',        label: 'Bags & Accessories',  short: 'Bags',       emoji: '👜', stack: 35 },
  { id: 'hats',        label: 'Hats',                short: 'Hats',       emoji: '🎩', stack: 90 },
  { id: 'sunglasses',  label: 'Sunglasses',          short: 'Sunglasses', emoji: '🕶️', stack: 80 },
  { id: 'outerwear',   label: 'Outerwear',           short: 'Outerwear',  emoji: '🧥', stack: 55 },
  { id: 'activewear',  label: 'Activewear',          short: 'Active',     emoji: '🩱', stack: 40 }
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function categoryLabel(id) {
  return CATEGORY_BY_ID[id]?.label || id;
}

export function shortCategoryLabel(id) {
  return CATEGORY_BY_ID[id]?.short || CATEGORY_BY_ID[id]?.label || id;
}

export function stackOrder(item) {
  return CATEGORY_BY_ID[item.category]?.stack ?? 50;
}
