export function getSliderNumber(value: unknown, fallback: number, min = -Infinity, max = Infinity): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const numeric = typeof raw === "number" && Number.isFinite(raw) ? raw : fallback;
  return Math.min(max, Math.max(min, numeric));
}

export function getSliderTuple(value: unknown, fallback: number, min = -Infinity, max = Infinity): [number] {
  return [getSliderNumber(value, fallback, min, max)];
}
