// Trippy FX — plasma fields, mandalas, kaleidoscopes, flow warps.
// All write to a virtual Grid. Designed for ornamental cinematic ASCII.
import { pick } from './palettes.js';

// Plasma field — classic sine-based pseudo-color, mapped to char density.
// `palette` ramps low→high density. `aspect` corrects char height/width.
export function plasma(grid, t, palette, opts = {}) {
  const { intensity = 1, aspect = 0.5, scale = 0.12 } = opts;
  if (intensity <= 0) return;
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const fx = x * scale;
      const fy = y * scale / aspect;
      const v =
        Math.sin(fx + t) +
        Math.sin(fy + t * 1.2) +
        Math.sin((fx + fy + t * 0.7) * 0.5) +
        Math.sin(Math.sqrt(fx * fx + fy * fy) * 0.6 + t);
      // normalize ~[-4,4] → [0,1]
      const n = (v + 4) / 8;
      const i = Math.pow(n, 1.3) * intensity;
      if (i < 0.05) continue;
      const ch = pick(palette, i);
      if (ch !== ' ' && grid.get(x, y) === ' ') grid.set(x, y, ch);
    }
  }
}

// Radial mandala — n-fold symmetric ornament around (cx, cy).
// Each segment mirrors a single ray pattern.
export function mandala(grid, cx, cy, radius, segments, t, prog, palette) {
  if (prog <= 0) return;
  // Draw one ray, then mirror across N segments.
  // Sample along radius with sine-modulated thickness.
  const rays = segments;
  const aspect = 0.5; // char height/width compensation
  for (let r = 1; r <= radius; r++) {
    const rp = r / radius;
    // Reveal expands outward
    if (rp > prog) break;
    // Petal modulation: char density follows sine wave per radius
    const petalDensity = 0.5 + 0.5 * Math.sin(rp * 6 + t * 1.5);
    const baseIntensity = (1 - rp) * 0.9 + petalDensity * 0.3;
    // For each angle in segment, draw mirrored
    const arcSamples = Math.max(rays * 3, Math.floor(2 * Math.PI * r));
    for (let s = 0; s < arcSamples; s++) {
      const a = (s / arcSamples) * 2 * Math.PI;
      // Symmetric modulation: angle-based pattern repeats every (2π/rays)
      const segA = (a * rays) % (2 * Math.PI);
      const sym = 0.5 + 0.5 * Math.cos(segA);
      const sym2 = 0.5 + 0.5 * Math.sin(segA * 2 + t * 0.6);
      const v = baseIntensity * sym * sym2;
      if (v < 0.15) continue;
      const x = Math.round(cx + Math.cos(a + t * 0.15) * r);
      const y = Math.round(cy + Math.sin(a + t * 0.15) * r * aspect);
      const ch = pick(palette, v);
      if (ch !== ' ' && grid.get(x, y) === ' ') grid.set(x, y, ch);
    }
  }
}

// Kaleidoscope — mirrors a source pattern across N segments.
// `sourceFn(x, y, t) -> intensity 0..1` provides the base wedge.
export function kaleidoscope(grid, cx, cy, segments, t, sourceFn, palette, opts = {}) {
  const { maxR = 28, aspect = 0.5 } = opts;
  for (let r = 1; r <= maxR; r++) {
    const samples = Math.max(8, Math.floor(2 * Math.PI * r));
    for (let s = 0; s < samples; s++) {
      const a = (s / samples) * 2 * Math.PI;
      // Fold angle into single wedge
      const wedge = (a * segments / (2 * Math.PI)) % 1;
      // Mirror within wedge to avoid seams
      const w = wedge < 0.5 ? wedge * 2 : (1 - wedge) * 2;
      const sx = r * Math.cos(w * Math.PI - Math.PI / 2);
      const sy = r * Math.sin(w * Math.PI - Math.PI / 2);
      const v = sourceFn(sx, sy, t);
      if (v < 0.1) continue;
      const x = Math.round(cx + Math.cos(a) * r);
      const y = Math.round(cy + Math.sin(a) * r * aspect);
      const ch = pick(palette, v);
      if (ch !== ' ' && grid.get(x, y) === ' ') grid.set(x, y, ch);
    }
  }
}

// Flow field — warps a base position by sine-based vector field, places glyphs.
export function flowField(grid, t, palette, opts = {}) {
  const { density = 0.12, scale = 0.18, warp = 4 } = opts;
  const count = Math.floor(grid.cols * grid.rows * density);
  // Deterministic but time-varying seed
  for (let i = 0; i < count; i++) {
    const baseX = (i * 7) % grid.cols;
    const baseY = Math.floor(i / grid.cols * 1.3) % grid.rows;
    const dx = Math.sin(baseX * scale + t * 0.7) * warp;
    const dy = Math.cos(baseY * scale + t * 0.8) * warp * 0.5;
    const x = Math.round(baseX + dx);
    const y = Math.round(baseY + dy);
    const v = 0.4 + 0.6 * Math.sin((baseX + baseY) * scale + t);
    const ch = pick(palette, v);
    if (ch !== ' ' && grid.get(x, y) === ' ') grid.set(x, y, ch);
  }
}

// Concentric ring ornament — N rings of varying density expanding outward
export function concentricRings(grid, cx, cy, count, t, prog, palette) {
  if (prog <= 0) return;
  for (let i = 0; i < count; i++) {
    const ringR = (i + 1) * 3;
    const rp = (i + 1) / count;
    if (rp > prog) break;
    const aspect = 0.5;
    const samples = Math.max(12, Math.floor(2 * Math.PI * ringR));
    for (let s = 0; s < samples; s++) {
      const a = (s / samples) * 2 * Math.PI;
      // Per-ring rotation + per-position pulse
      const phaseShift = i * 0.4 + t * (i % 2 === 0 ? 0.5 : -0.5);
      const v = 0.4 + 0.6 * Math.sin(a * (i + 2) + phaseShift);
      const x = Math.round(cx + Math.cos(a) * ringR);
      const y = Math.round(cy + Math.sin(a) * ringR * aspect);
      const ch = pick(palette, v);
      if (ch !== ' ' && grid.get(x, y) === ' ') grid.set(x, y, ch);
    }
  }
}

// Spiral arm ornament
export function spiral(grid, cx, cy, arms, turns, t, prog, palette) {
  if (prog <= 0) return;
  const maxR = 22;
  for (let r = 1; r <= maxR * prog; r += 0.5) {
    for (let arm = 0; arm < arms; arm++) {
      const a = (arm / arms) * 2 * Math.PI + (r / maxR) * turns * 2 * Math.PI + t * 0.4;
      const x = Math.round(cx + Math.cos(a) * r);
      const y = Math.round(cy + Math.sin(a) * r * 0.5);
      const v = (1 - r / maxR) * (0.6 + 0.4 * Math.sin(r + t * 2));
      const ch = pick(palette, v);
      if (ch !== ' ' && grid.get(x, y) === ' ') grid.set(x, y, ch);
    }
  }
}

// === Distinct visual languages per scene ===

// Diamond tessellation — flat ornamental tiling. Reveals top-down by rows.
export function tessellation(grid, t, prog, opts = {}) {
  const {
    cellW = 10, cellH = 5, x0 = 0, y0 = 0,
    cols = Math.floor((grid.cols - x0) / cellW),
    rows = Math.floor((grid.rows - y0) / cellH),
    palette = ' ░▒▓█',
  } = opts;
  if (prog <= 0) return;
  const total = cols * rows;
  const revealed = Math.floor(total * prog);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= revealed) return;
      const ox = x0 + c * cellW + (r % 2 === 0 ? 0 : Math.floor(cellW / 2));
      const oy = y0 + r * cellH;
      const cx = ox + Math.floor(cellW / 2);
      const cy = oy + Math.floor(cellH / 2);
      const v = 0.45 + 0.55 * Math.sin(c * 0.5 + r * 0.7 + t);
      const hw = Math.floor((cellW - 2) / 2);
      const hh = Math.floor((cellH - 1) / 2);
      // Diamond outline
      for (let dy = -hh; dy <= hh; dy++) {
        const ratio = 1 - Math.abs(dy) / (hh + 0.0001);
        const half = Math.floor(hw * ratio);
        const ch = pick(palette, v * (0.6 + 0.4 * Math.cos(dy * 0.8)));
        if (ch !== ' ') {
          grid.set(cx - half, cy + dy, ch);
          grid.set(cx + half, cy + dy, ch);
        }
      }
      // Center glyph based on parity
      const glyphs = ['◇', '◈', '◆', '◉', '◎'];
      const gi = Math.floor((c + r * 2 + t * 0.5) % glyphs.length);
      grid.set(cx, cy, glyphs[(gi + glyphs.length) % glyphs.length]);
    }
  }
}

// Waveform plot — sinusoidal trace on a centerline
export function waveform(grid, cy, t, opts = {}) {
  const {
    amp = 6, freq = 0.18, phaseShift = 0,
    color = '·', drawn = 1,
    xStart = 0, xEnd = grid.cols,
  } = opts;
  if (drawn <= 0) return;
  const total = xEnd - xStart;
  const visible = Math.floor(total * drawn);
  for (let i = 0; i < visible; i++) {
    const x = xStart + i;
    const wave = Math.sin(x * freq + t * 2 + phaseShift);
    const y = Math.round(cy + wave * amp);
    if (grid.get(x, y) === ' ') grid.set(x, y, color);
  }
}

// Interference — two waves overlayed → beats and nulls (oscilloscope feel)
export function interference(grid, cy, t, opts = {}) {
  const {
    amp1 = 5, amp2 = 5, freq1 = 0.2, freq2 = 0.25,
    intensity = 1, palette = ' ·∙◦●◉',
    xStart = 0, xEnd = grid.cols,
  } = opts;
  if (intensity <= 0) return;
  for (let x = xStart; x < xEnd; x++) {
    const w1 = Math.sin(x * freq1 + t * 2) * amp1;
    const w2 = Math.sin(x * freq2 + t * 2.2) * amp2;
    const combined = (w1 + w2) / 2;
    const yC = Math.round(cy + combined);
    const beat = Math.abs((w1 + w2) / (amp1 + amp2));
    const ch = pick(palette, intensity * beat);
    if (grid.get(x, yC) === ' ') grid.set(x, yC, ch);
    // Faint component plots
    const y1 = Math.round(cy + w1);
    const y2 = Math.round(cy + w2);
    if (grid.get(x, y1) === ' ') grid.set(x, y1, '·');
    if (grid.get(x, y2) === ' ') grid.set(x, y2, '·');
  }
}

// Vertical scanlines — sweeping light columns (BR2049 vertical depth)
export function verticalScan(grid, t, intensity, palette = ' .·:+*') {
  if (intensity <= 0) return;
  const cols = grid.cols;
  // 3 sweeping columns at different speeds
  const sweeps = [
    { x: ((t * 30) % (cols + 20)) - 10, w: 3 },
    { x: ((t * 18 + 50) % (cols + 20)) - 10, w: 2 },
    { x: ((t * 45 + 90) % (cols + 20)) - 10, w: 4 },
  ];
  sweeps.forEach((s) => {
    for (let dy = 2; dy < grid.rows - 5; dy++) {
      for (let dx = -s.w; dx <= s.w; dx++) {
        const edge = 1 - Math.abs(dx) / (s.w + 1);
        const v = intensity * edge * 0.4;
        const ch = pick(palette, v);
        const xi = Math.round(s.x + dx);
        if (ch !== ' ' && grid.get(xi, dy) === ' ') grid.set(xi, dy, ch);
      }
    }
  });
}
