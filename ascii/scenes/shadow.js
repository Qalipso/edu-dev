// SHADOW — BR2049 mood + trippy mandala portal
// Walking-into-signal atmosphere. Light pillar crowned with kaleidoscopic
// mandala. Phase-warped fog ribbons. Pulse sigil replaces alarm.
import { phase, easeInOut, easeOut, seeded } from '../engine/easing.js';
import { pick, lamp, ornament } from '../engine/palettes.js';
import { mandala, plasma, concentricRings, verticalScan } from '../engine/trippy.js';

const COLS = 140;
const ROWS = 38;
const DUR = 4.0;

// Phase-warped fog ribbons
function drawFog(grid, t, intensity) {
  const rng = seeded(11);
  const bands = [
    { y: 28, sp: 1.2, w: 1.5 },
    { y: 29, sp: 1.6, w: 1.0 },
    { y: 30, sp: 0.8, w: 2.0 },
    { y: 31, sp: 1.0, w: 1.4 },
    { y: 32, sp: 0.5, w: 1.8 },
  ];
  const chars = '∿~≈﹏';
  bands.forEach((b) => {
    for (let x = 0; x < COLS; x++) {
      const warp = Math.sin(x * 0.12 + t * b.sp) * b.w;
      const yy = Math.round(b.y + warp);
      const phaseI = 0.5 + 0.5 * Math.sin(x * 0.18 + t * b.sp * 0.7);
      if (rng() < intensity * phaseI) {
        grid.set(x, yy, chars[Math.floor(rng() * chars.length)]);
      }
    }
  });
}

// Light pillar topped with mandala portal
function drawPillar(grid, px, groundY, height, glow, t, mandalaProg) {
  if (glow <= 0) return;
  for (let i = 0; i < height; i++) {
    const y = groundY - i;
    const verticalI = glow * (1 - Math.pow((i / height) - 0.5, 2) * 1.6);
    const ch = pick(lamp, verticalI);
    if (ch !== ' ') {
      grid.set(px, y, ch);
      grid.set(px + 1, y, ch);
      if (verticalI > 0.5) grid.set(px - 1, y, pick(lamp, verticalI - 0.2));
    }
  }
  // Halo
  for (let i = 0; i < height; i++) {
    const y = groundY - i;
    const yRatio = i / height;
    const haloW = Math.floor(2 + yRatio * 9);
    for (let dx = -haloW; dx <= haloW + 1; dx++) {
      if (Math.abs(dx) < 2) continue;
      const edge = 1 - Math.abs(dx) / (haloW + 2);
      const i2 = glow * edge * (1 - yRatio * 0.4) * 0.65;
      const ch = pick(' .,:·;+', i2);
      if (ch !== ' ' && grid.get(px + dx, y) === ' ') grid.set(px + dx, y, ch);
    }
  }
  // Ground pool
  const poolW = 22;
  for (let dx = -poolW; dx <= poolW + 1; dx++) {
    const edge = 1 - Math.abs(dx) / (poolW + 1);
    const i = glow * edge * 0.8;
    const ch = pick(lamp, i);
    if (ch !== ' ' && grid.get(px + dx, groundY) === ' ') grid.set(px + dx, groundY, ch);
    const ch2 = pick(' .,·', i * 0.5);
    if (ch2 !== ' ' && grid.get(px + dx, groundY + 1) === ' ') grid.set(px + dx, groundY + 1, ch2);
  }
  // Mandala portal at pillar top
  const headY = groundY - height - 1;
  if (mandalaProg > 0) {
    mandala(grid, px + 1, headY, 8, 8, t, mandalaProg, ornament);
    concentricRings(grid, px + 1, headY, 3, t, mandalaProg, ornament);
  }
}

// Twinkling stars
function drawStars(grid, t) {
  const stars = [
    [12, 3, '·'], [28, 5, '*'], [42, 2, '·'], [58, 4, '.'],
    [88, 3, '·'], [102, 6, '*'], [134, 5, '.'],
    [8, 8, '.'], [38, 10, '·'], [22, 14, '.'],
    [70, 6, '.'], [76, 9, '*'], [4, 12, '·'],
  ];
  stars.forEach(([x, y, ch]) => {
    const tw = 0.5 + 0.5 * Math.sin(t * 3 + x * 0.7);
    grid.set(x, y, tw > 0.6 ? ch : '·');
  });
}

// Pulsing sigil — replaces alarm
function drawCenterSigil(grid, cx, cy, t, intensity) {
  if (intensity <= 0.05) return;
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  const radius = 3 + pulse * 2;
  for (let r = 1; r <= radius; r++) {
    const ringI = intensity * (1 - r / (radius + 1));
    if (ringI < 0.15) continue;
    const ch = pick(' ·:◌○◉', ringI);
    if (ch === ' ') continue;
    const points = Math.floor(2 * Math.PI * r);
    for (let p = 0; p < points; p++) {
      const a = (p / points) * 2 * Math.PI + t * 0.3;
      const x = Math.round(cx + Math.cos(a) * r);
      const y = Math.round(cy + Math.sin(a) * r * 0.5);
      if (grid.get(x, y) === ' ') grid.set(x, y, ch);
    }
  }
  grid.set(cx, cy, pulse > 0.7 ? '◉' : '●');
}

function drawSigil(grid, t, prog) {
  if (prog <= 0) return;
  const lines = [
    '◇   ◈   ◆   ◈   ◇',
    '░ ▒ ▓ █ ▓ ▒ ░',
  ];
  const baseY = 36;
  lines.forEach((line, idx) => {
    const lp = phase(prog, idx * 0.18, 0.4 + idx * 0.18);
    if (lp > 0) {
      const x = Math.floor((COLS - line.length) / 2);
      grid.text(x, baseY - (lines.length - 1 - idx), line.slice(0, Math.floor(line.length * lp)));
    }
  });
}

export const shadow = {
  id: 'shadow',
  cols: COLS,
  rows: ROWS,
  duration: DUR,
  title: 'SHADOW',
  subtitle: 'AI SECOND BRAIN',
  draw(grid, t) {
    // Very faint plasma background haze
    plasma(grid, t * 0.3, ' .', { intensity: 0.3, scale: 0.08 });

    // Vertical light scanlines — sweeping columns (BR2049 vertical depth)
    const scanI = phase(t, 1.0, 3.6) * 0.6;
    verticalScan(grid, t, scanI, ' .·:+');

    drawStars(grid, t);

    const sigilI = phase(t, 0, 0.5) * (1 - phase(t, 1.0, 1.6));
    drawCenterSigil(grid, 70, 16, t, sigilI);

    drawFog(grid, t, 0.55);

    const horizonI = easeOut(phase(t, 1.4, 2.4));
    if (horizonI > 0) {
      for (let x = 0; x < COLS; x++) {
        const i = horizonI * (0.4 + 0.6 * Math.sin(x * 0.05 + t));
        if (i > 0.5) grid.set(x, 33, '─');
      }
    }

    const walkP = phase(t, 0.8, 3.8);
    if (walkP > 0) {
      const fx = Math.round(20 + easeInOut(walkP) * 58);
      const fy = 32;
      grid.set(fx, fy, '人');
      grid.set(fx, fy + 1, '_');
      for (let i = 1; i <= 6; i++) {
        const tx = fx - i * 3;
        const trail = (1 - i / 7) * walkP;
        if (trail > 0.7 && grid.get(tx, fy + 1) === ' ') grid.set(tx, fy + 1, '·');
      }
    }

    const pillarP = phase(t, 1.6, DUR);
    if (pillarP > 0) {
      const pillarX = 108;
      const groundY = 33;
      const h = Math.floor(28 * easeOut(Math.min(1, pillarP * 1.5)));
      let glow;
      if (t < 2.0) glow = pillarP * 0.4;
      else if (t < 2.6) {
        const base = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 14));
        const drop = (Math.sin(t * 47) > 0.85) ? 0.4 : 1.0;
        glow = base * drop;
      } else {
        glow = 1.0;
      }
      const mandalaP = easeOut(phase(t, 2.4, 3.6));
      drawPillar(grid, pillarX, groundY, h, glow, t, mandalaP);
    }

    const sigilP = phase(t, 2.8, 3.6);
    if (sigilP > 0) drawSigil(grid, t, sigilP);
  },
};
