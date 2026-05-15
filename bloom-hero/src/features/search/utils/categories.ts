export const CATEGORY_LABELS: Record<string, string> = {
  graduation: "Graduation Cheers",
  "in-loving-memory": "In Loving Memory",
  "new-beginnings": "New Beginnings",
  "love-notes": "Love Notes in Bloom",
  handcrafted: "Handcrafted",
  anniversary: "Anniversary Classics",
  "gentle-comfort": "Gentle Comfort",
  birthday: "Birthday Blooms",
  "just-because": "Just Because",
  "missing-you": "Missing You",
  "get-well": "Get Well Soon",
  "florists-picks": "Florists' Picks",
};

const CATEGORY_VALUES = new Set(Object.keys(CATEGORY_LABELS));

export function normalizeCategory(value: string | null) {
  if (!value) return null;
  const normalized = value.trim();
  return CATEGORY_VALUES.has(normalized) ? normalized : null;
}
