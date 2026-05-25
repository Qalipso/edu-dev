// Atmospheric FX helpers — depth layers, dust, glow, rain.
import { pick, dim } from './palettes.js';
import { seeded } from './easing.js';

// Drift of micro particles — used as cinematic atmosphere
export function atmosphericDust(grid, t, density = 0.35, seed = 11) {
  const rng = seeded(seed);
  const count = Math.floor(grid.cols * grid.rows * density * 0.04);
  for (let i = 0; i < count; i++) {
    const baseX = rng() * grid.cols;
    const baseY = rng() * grid.rows;
    const x = Math.round(baseX + Math.sin(t * 0.5 + i) * 1.5);
    const y = Math.round(baseY + Math.cos(t * 0.4 + i * 0.7) * 0.8);
    const intensity = 0.2 + 0.3 * Math.sin(t + i * 0.3);
    const ch = pick(dim, intensity * density);
    if (ch !== ' ' && grid.get(x, y) === ' ') grid.set(x, y, ch);
  }
}

// Radial glow around point — fills char by intensity
export function radialGlow(grid, cx, cy, radius, palette, strength = 1) {
  for (let r = 1; r <= radius; r++) {
    const intensity = strength * (1 - r / radius);
    // Sample circle perimeter
    const steps = Math.max(8, Math.floor(2 * Math.PI * r));
    for (let s = 0; s < steps; s++) {
      const a = (s / steps) * 2 * Math.PI;
      const x = Math.round(cx + Math.cos(a) * r);
      const y = Math.round(cy + Math.sin(a) * r * 0.5);
      const ch = pick(palette, intensity);
      if (ch !== ' ' && grid.get(x, y) === ' ') grid.set(x, y, ch);
    }
  }
}

// Distant silhouette skyline
export function drawSkyline(grid, y, palette = ' .,-_=▁▂▃', seed = 9) {
  const rng = seeded(seed);
  for (let x = 0; x < grid.cols; x++) {
    const h = Math.floor(rng() * palette.length);
    grid.set(x, y, palette[h]);
  }
}

// Falling rain streaks
export function rain(grid, t, density, palette = '|.\'`') {
  const cols = grid.cols;
  const rows = grid.rows;
  const count = Math.floor(cols * density);
  const rng = seeded(33);
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rng() * cols);
    const speed = 8 + rng() * 6;
    const offset = rng() * rows;
    const y = Math.floor((t * speed + offset) % rows);
    const ch = palette[Math.floor(rng() * palette.length)];
    if (grid.get(x, y) === ' ') grid.set(x, y, ch);
  }
}

// Light beam — directional, angled
export function lightBeam(grid, ox, oy, dx, dy, length, palette, strength = 1) {
  for (let r = 0; r < length; r++) {
    const intensity = strength * (1 - r / length);
    const w = Math.floor(r * 0.4);
    for (let s = -w; s <= w; s++) {
      const edge = 1 - Math.abs(s) / (w + 1);
      const ix = intensity * edge;
      const ch = pick(palette, ix);
      if (ch === ' ') continue;
      // Perpendicular vector (rotate 90deg)
      const px = -dy;
      const py = dx;
      const x = Math.round(ox + dx * r + px * s);
      const y = Math.round(oy + dy * r + py * s);
      if (grid.get(x, y) === ' ') grid.set(x, y, ch);
    }
  }
}

// Type-writer reveal: show first n chars based on progress
export function typeReveal(text, progress) {
  const n = Math.floor(text.length * progress);
  return text.slice(0, n);
}
