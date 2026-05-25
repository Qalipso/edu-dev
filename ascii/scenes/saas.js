// SAAS — flat diamond tessellation lattice
// Distinct identity: NO central focal point. Edge-to-edge ornamental TILING.
// Chaos noise → tessellation tiles bloom from top-left, fill grid in rows →
// fully tiled lattice settles → sigil. Escher-flat, repetitive, gridded.
import { phase, easeInOut, easeOut, seeded } from '../engine/easing.js';
import { pick, ornament, psy } from '../engine/palettes.js';
import { tessellation, plasma } from '../engine/trippy.js';

const COLS = 140;
const ROWS = 38;
const DUR = 4.0;

function drawChaos(grid, t, intensity) {
  if (intensity <= 0) return;
  const rng = seeded(42);
  const count = Math.floor(220 * intensity);
  const ch = '·.,:;\'';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rng() * COLS);
    const y = Math.floor(rng() * ROWS);
    if (grid.get(x, y) === ' ') {
      grid.set(x, y, ch[Math.floor(rng() * ch.length)]);
    }
  }
}

function drawSigil(grid, t, prog) {
  if (prog <= 0) return;
  const lines = [
    '◇  ◈  ◆  ◈  ◇  ◈  ◆',
    '░ ▒ ▓ █ ▓ ▒ ░',
  ];
  const baseY = 36;
  lines.forEach((line, idx) => {
    const lp = phase(prog, idx * 0.18, 0.4 + idx * 0.18);
    if (lp > 0) {
      const x = Math.floor((COLS - line.length) / 2);
      for (let i = 0; i < COLS; i++) grid.set(i, baseY - (lines.length - 1 - idx), ' ');
      grid.text(x, baseY - (lines.length - 1 - idx), line.slice(0, Math.floor(line.length * lp)));
    }
  });
}

// Frame brackets — Escher-style border ornament
function drawFrame(grid, prog) {
  if (prog <= 0) return;
  const len = Math.floor(COLS * prog);
  // Top + bottom bars
  for (let x = 0; x < len; x++) {
    grid.set(x, 2, '─');
    grid.set(x, 33, '─');
  }
  // Corner glyphs
  if (prog > 0.7) {
    grid.set(0, 2, '╭');
    grid.set(COLS - 1, 2, '╮');
    grid.set(0, 33, '╰');
    grid.set(COLS - 1, 33, '╯');
  }
}

export const saas = {
  id: 'saas',
  cols: COLS,
  rows: ROWS,
  duration: DUR,
  title: 'SAAS CASE STUDY',
  subtitle: 'FROM CHAOS TO DELIVERY SYSTEM',
  draw(grid, t) {
    // PHASE 1: chaos plasma 0–1.4s fading
    const chaosI = 1 - easeOut(phase(t, 0.7, 1.5));
    if (chaosI > 0) {
      plasma(grid, t * 1.5, ' .,:;', { intensity: chaosI * 0.8, scale: 0.18 });
      drawChaos(grid, t, chaosI * 0.4);
    }

    // PHASE 2: tessellation tiles bloom row by row 0.8–3.2s
    const tessP = easeInOut(phase(t, 0.8, 3.2));
    if (tessP > 0) {
      tessellation(grid, t * 0.6, tessP, {
        cellW: 10,
        cellH: 5,
        x0: 2,
        y0: 4,
        cols: 14,
        rows: 6,
        palette: ' ░▒▓█',
      });
    }

    // Frame appears 2.4–3.2
    drawFrame(grid, easeOut(phase(t, 2.4, 3.2)));

    // Bottom sigil
    const sigilP = phase(t, 3.0, 3.6);
    if (sigilP > 0) drawSigil(grid, t, sigilP);
  },
};
