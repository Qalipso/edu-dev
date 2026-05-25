// RAG MEMORY — Arrival heptapod logogram reference
// Black void. Fragments float in. Ink ring forms central glyph.
// Branches radiate inward — semantic spokes. Labels resolve from drift.
import { phase, easeInOut, easeOut, seeded } from '../engine/easing.js';
import { pick, dim, vortex } from '../engine/palettes.js';

const COLS = 140;
const ROWS = 38;
const DUR = 4.0;
const CX = 50;
const CY = 19;

// Heptapod ring — main glyph circle, drawn at radius R, char by char
function drawRing(grid, cx, cy, rx, ry, prog, t) {
  if (prog <= 0) return;
  const steps = 220;
  const drawn = Math.floor(steps * prog);
  // Wobble — ring inkiness pulses
  for (let i = 0; i < drawn; i++) {
    const a = (i / steps) * 2 * Math.PI - Math.PI / 2;
    const wobble = 1 + 0.03 * Math.sin(a * 5 + t * 1.2);
    const x = Math.round(cx + Math.cos(a) * rx * wobble);
    const y = Math.round(cy + Math.sin(a) * ry * wobble);
    // Inky thickness — use ●  ◉ pattern
    const phase01 = (i / steps) * Math.PI * 6 + t;
    const thickness = 0.6 + 0.4 * Math.sin(phase01);
    const ch = thickness > 0.85 ? '●' : (thickness > 0.6 ? '◉' : (thickness > 0.4 ? 'o' : '·'));
    grid.set(x, y, ch);
  }
}

// Inward branches — like ink spokes from ring inward
function drawBranches(grid, cx, cy, rx, ry, prog, t) {
  if (prog <= 0) return;
  const branches = 7; // heptapod = 7
  for (let b = 0; b < branches; b++) {
    const lp = phase(prog, b * 0.06, 0.4 + b * 0.06);
    if (lp <= 0) continue;
    const a = (b / branches) * 2 * Math.PI - Math.PI / 2;
    const startX = cx + Math.cos(a) * rx * 0.95;
    const startY = cy + Math.sin(a) * ry * 0.95;
    const endX = cx + Math.cos(a) * rx * 0.25;
    const endY = cy + Math.sin(a) * ry * 0.25;
    const steps = 12;
    const drawn = Math.floor(steps * lp);
    for (let i = 0; i < drawn; i++) {
      const r = i / steps;
      const x = Math.round(startX + (endX - startX) * r);
      const y = Math.round(startY + (endY - startY) * r);
      const ch = i === drawn - 1 ? '◌' : (r < 0.4 ? '·' : (r < 0.7 ? 'o' : 'O'));
      if (grid.get(x, y) === ' ') grid.set(x, y, ch);
    }
  }
}

// Concentric arcs inside ring — adds glyph complexity
function drawInnerArcs(grid, cx, cy, prog, t) {
  if (prog <= 0) return;
  const arcs = [
    { r: 6,  ry: 3, start: 0,   end: Math.PI * 1.2 },
    { r: 9,  ry: 4, start: Math.PI * 0.5, end: Math.PI * 1.8 },
    { r: 12, ry: 5, start: Math.PI * 1.0, end: Math.PI * 2.2 },
  ];
  arcs.forEach((arc, idx) => {
    const lp = phase(prog, idx * 0.12, 0.4 + idx * 0.12);
    if (lp <= 0) return;
    const angleRange = arc.end - arc.start;
    const steps = Math.floor(angleRange * arc.r * 1.5);
    const drawn = Math.floor(steps * lp);
    for (let i = 0; i < drawn; i++) {
      const a = arc.start + (i / steps) * angleRange;
      const x = Math.round(cx + Math.cos(a) * arc.r);
      const y = Math.round(cy + Math.sin(a) * arc.ry);
      grid.set(x, y, '·');
    }
  });
}

// Central core — pulsing ink dot
function drawCore(grid, cx, cy, t) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  grid.set(cx, cy, pulse > 0.7 ? '◉' : '●');
  const halo = [[-1,0],[1,0],[0,-1],[0,1]];
  halo.forEach(([dx,dy]) => {
    if (pulse > 0.5 && grid.get(cx+dx,cy+dy)===' ') grid.set(cx+dx,cy+dy,'·');
  });
}

// Abstract holographic node sigils — geometric glyphs replace text labels
const NODE_GLYPHS = ['◇', '◈', '◆', '◉', '◎', '◐', '◑'];

function drawLabels(grid, prog, cx, cy, rx, ry) {
  if (prog <= 0) return;
  NODE_GLYPHS.forEach((g, i) => {
    const lp = phase(prog, i * 0.04, 0.4 + i * 0.04);
    if (lp <= 0.4) return;
    const a = (i / NODE_GLYPHS.length) * 2 * Math.PI - Math.PI / 2;
    const x = Math.round(cx + Math.cos(a) * (rx + 4));
    const y = Math.round(cy + Math.sin(a) * (ry + 1.4));
    grid.set(x, y, g);
    // satellite dots
    grid.set(x - 2, y, '·');
    grid.set(x + 2, y, '·');
  });
}

// Floating fragments before glyph forms
function drawFragments(grid, t, intensity) {
  if (intensity <= 0) return;
  const rng = seeded(99);
  const frags = ['{ }', '[ ]', '< >', 'o', 'O', '·', '◌', '◍'];
  const count = 80;
  for (let i = 0; i < count; i++) {
    const baseX = rng() * COLS;
    const baseY = rng() * ROWS;
    const x = Math.round(baseX + Math.sin(t * 0.8 + i) * 2 * intensity);
    const y = Math.round(baseY + Math.cos(t * 0.6 + i * 0.7) * intensity);
    if (rng() > intensity) continue;
    const f = frags[Math.floor(rng() * frags.length)];
    if (grid.get(x, y) === ' ') grid.set(x, y, f[0]);
  }
}

// Abstract HUD — bars + glyphs only (no readable text)
function drawSideHUD(grid, t, prog) {
  if (prog <= 0) return;
  const tl = [
    '┌───────────────────┐',
    '│ ◇ ░░░░░░░░░░░░░░  │',
    '│ ◈ ▒▒▒▒▒▒▒░░░░░░░  │',
    '│ ◆ ▓▓▓▓▓▓▓▓▓░░░░░  │',
    '│ ◉ ████████████░░  │',
    '└───────────────────┘',
  ];
  tl.forEach((line, idx) => {
    const lp = phase(prog, idx * 0.05, 0.3 + idx * 0.05);
    if (lp > 0) grid.text(2, 1 + idx, line.slice(0, Math.floor(line.length * lp)));
  });
  const br = [
    '┌──────────────────────────┐',
    '│ ⟨  ░░░  ▒▒▒  ▓▓▓  ⟩      │',
    '│  · · · · · · · · · · ·   │',
    '│  ◇ ◈ ◆ ◈ ◇ ◈ ◆ ◈         │',
    '│  ─────────────────────   │',
    '│  ▒▒▒▒▒▒▒░░░░░░░░░░░░░    │',
    '│  → ◉  ◉  ◉  ◉            │',
    '└──────────────────────────┘',
  ];
  br.forEach((line, idx) => {
    const lp = phase(prog, 0.2 + idx * 0.05, 0.5 + idx * 0.05);
    if (lp > 0) grid.text(108, 1 + idx, line.slice(0, Math.floor(line.length * lp)));
  });
}

export const ragMemory = {
  id: 'rag-memory',
  cols: COLS,
  rows: ROWS,
  duration: DUR,
  title: 'RAG MEMORY PLAYGROUND',
  subtitle: 'CONTEXT BECOMES A MAP',
  draw(grid, t) {
    // Phase 1: floating fragments
    const fragI = 1 - easeOut(phase(t, 0.8, 1.8));
    drawFragments(grid, t, fragI * 0.7);

    // Phase 2: ring forms 0.8–2.0s
    const ringP = easeOut(phase(t, 0.8, 2.0));
    const rx = 18, ry = 8;
    drawRing(grid, CX, CY, rx, ry, ringP, t);

    // Phase 3: inner arcs 1.4–2.6s
    drawInnerArcs(grid, CX, CY, easeOut(phase(t, 1.4, 2.6)), t);

    // Phase 4: branches radiate 2.0–3.0s
    drawBranches(grid, CX, CY, rx, ry, easeOut(phase(t, 2.0, 3.0)), t);

    // Core pulse
    if (ringP > 0.4) drawCore(grid, CX, CY, t);

    // Labels around glyph 2.8–3.6s
    drawLabels(grid, phase(t, 2.8, 3.6), CX, CY, rx, ry);

    // Side HUD 2.4–3.6s
    drawSideHUD(grid, t, phase(t, 2.4, 3.6));

    // Abstract sigil bottom
    const sigilP = phase(t, 3.0, 3.6);
    if (sigilP > 0) {
      const lines = [
        '◇ ◈ ◆ ◈ ◇ ◈ ◆ ◈ ◇',
        '· ─ ▒ ▓ █ ▓ ▒ ─ ·',
      ];
      const baseY = 36;
      lines.forEach((line, idx) => {
        const lp = phase(sigilP, idx * 0.18, 0.4 + idx * 0.18);
        if (lp > 0) {
          const len = Math.floor(line.length * lp);
          const x = Math.floor((COLS - line.length) / 2);
          for (let i = 0; i < COLS; i++) grid.set(i, baseY - (lines.length - 1 - idx), ' ');
          grid.text(x, baseY - (lines.length - 1 - idx), line.slice(0, len));
        }
      });
    }
  },
};
