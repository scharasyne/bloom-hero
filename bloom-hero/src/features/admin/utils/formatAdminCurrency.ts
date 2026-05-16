export function formatPesoAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPesoCompact(value: number) {
  if (value >= 1_000_000) {
    return `₱${(value / 1_000_000).toFixed(2).replace(/\.0+$/, "")}M`;
  }
  if (value >= 1_000) {
    return `₱${(value / 1_000).toFixed(2).replace(/\.0+$/, "")}k`;
  }
  return formatPesoAmount(value);
}

export function formatOrderCount(value: number) {
  return new Intl.NumberFormat("en-PH").format(value);
}
