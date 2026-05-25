// Easing helpers. All take t∈[0,1], return [0,1].
export const linear = (t) => t;
export const easeInOut = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t) => t * t * t;
export const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Phase utility: returns local t∈[0,1] within [start,end] window. Outside → clamp.
export function phase(t, start, end) {
  if (t < start) return 0;
  if (t > end) return 1;
  return (t - start) / (end - start);
}

// Returns true if t is inside [start,end]
export function inPhase(t, start, end) {
  return t >= start && t <= end;
}

// Deterministic pseudo-random for reproducible scenes
export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// Smooth fade-in / fade-out window
export function fadeWindow(t, fadeIn, hold, fadeOut) {
  if (t < fadeIn) return t / fadeIn;
  if (t < fadeIn + hold) return 1;
  if (t < fadeIn + hold + fadeOut) return 1 - (t - fadeIn - hold) / fadeOut;
  return 0;
}
