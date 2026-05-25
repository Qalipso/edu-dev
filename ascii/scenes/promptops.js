// PROMPTOPS — Mr. Robot terminal reference
// Dark CRT terminal. Cursor types commands. Storage tree materializes inside
// a clean bordered TUI panel. Stats sidebar streams. Cinematic composed UI.
import { phase, easeInOut, easeOut, seeded } from '../engine/easing.js';
import { pick, dim } from '../engine/palettes.js';

const COLS = 140;
const ROWS = 38;
const DUR = 4.0;

// Abstract terminal prelude — glyph pulses (no readable commands)
const PRELUDE = [
  '⟨ ░░░░░░░░░░░░ ▒▒▒▒▒▒ ▓▓▓▓ ⟩',
  '⟩ ────────── · · · · · · · ─── ░░░░░░',
  '⟩ ░░ ▒▒ ▓▓ ██ ▓▓ ▒▒ ░░  ◇ ◈ ◆ ◈ ◇',
  '⟩ ░░░░░░░░░░░░░░',
];

const TREE_PANEL = [
  '┌──────────────────────────────────────────────────────────────────────────┐',
  '│  ├── ░░░░░░░                                                              │',
  '│  │   ├── ░░░░░░░░░░         ◇   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '│  │   ├── ░░░░░░░░░░         ◈   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '│  │   ├── ░░░░░░░░░░         ◆   ░▒▒░     ▓▓▓▓▓▓   ▒▒░                    │',
  '│  │   └── ░░░░░░░░░░         ◉   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '│  ├── ░░░░░                                                                │',
  '│  │   ├── ░░░░░░░░           ◐   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '│  │   ├── ░░░░░░░░           ◑   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '│  │   └── ░░░░░░░░           ◒   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '│  ├── ░░░                                                                  │',
  '│  │   ├── ░░░░░░░░░░         ◓   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '│  │   ├── ░░░░░░░░░░         ◔   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '│  │   └── ░░░░░░░░░░         ◕   ░▒▒░     ▓▓▓▓▓▓   ▒▒░                    │',
  '│  └── ░░░                                                                  │',
  '│      ├── ░░░░░░             ◇   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '│      └── ░░░░░░             ◈   ░░░░░    ▓▓▓▓▓▓   ░░░                    │',
  '└──────────────────────────────────────────────────────────────────────────┘',
];

// Mr. Robot–style top bar
function drawTopBar(grid, t) {
  const bar = '╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗';
  grid.text(2, 1, bar);
  const title = ' ◇ ◈ ◆ ◈ ◇  ░░░░░░░  ▒▒▒▒▒  ▓▓▓▓ ';
  const sysline = '⟨ ░░░ · ▒▒▒▒ · ▓▓▓ · ⠿ ⟩';
  grid.text(4, 2, '║' + ' '.repeat(bar.length - 2) + '║');
  grid.text(6, 2, title);
  grid.text(2 + bar.length - 2 - sysline.length, 2, sysline);
  grid.text(2, 3, '╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣');
}

// Bottom command bar
function drawBottomBar(grid, t) {
  grid.text(2, 30, '╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣');
  const cursor = (Math.floor(t * 3) % 2 === 0) ? '▌' : ' ';
  grid.text(4, 31, '⟩  ░░░░░░░░  ▒▒▒▒  ▓▓▓▓▓  ' + cursor);
  const status = '⟨ ◇ ◈ ◆ ◈ ◇ ◈ ◆ ◈ ◇ ⟩';
  grid.text(2 + 136 - status.length, 31, status);
  grid.text(2, 32, '╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝');
}

// Prelude typed at top — fades when tree appears
function drawPrelude(grid, t, prog, fade) {
  if (prog <= 0 || fade < 0.05) return;
  PRELUDE.forEach((line, idx) => {
    const lp = phase(prog, idx * 0.15, 0.3 + idx * 0.15);
    if (lp > 0) {
      const len = Math.floor(line.length * lp);
      const out = line.slice(0, len);
      grid.text(4, 5 + idx, out);
    }
  });
}

// Tree builds inside main panel
function drawTreePanel(grid, t, prog) {
  if (prog <= 0) return;
  const startX = 4;
  const startY = 11;
  // Box first
  grid.text(startX, startY - 1, TREE_PANEL[0]);
  // Contents typed line by line
  const totalLines = TREE_PANEL.length;
  const charsTotal = TREE_PANEL.reduce((s, l) => s + l.length, 0);
  const cursor = Math.floor(charsTotal * prog);
  let used = 0;
  for (let i = 0; i < totalLines; i++) {
    const line = TREE_PANEL[i];
    if (used >= cursor) break;
    const remaining = cursor - used;
    const len = Math.min(line.length, remaining);
    grid.text(startX, startY - 1 + i, line.slice(0, len));
    used += line.length;
  }
  // Blinking cursor
  if (prog < 1 && Math.floor(t * 4) % 2 === 0) {
    let used2 = 0;
    for (let i = 0; i < totalLines; i++) {
      const lineLen = TREE_PANEL[i].length;
      if (used2 + lineLen >= cursor) {
        grid.set(startX + (cursor - used2), startY - 1 + i, '▌');
        break;
      }
      used2 += lineLen;
    }
  }
}

// Abstract stats panel — glyph bars (no readable text)
function drawStatsPanel(grid, t, prog) {
  if (prog <= 0) return;
  const x = 110;
  const y = 5;
  const lines = [
    '╔═════════════════════════╗',
    '║  ◇  ◈  ◆  ◈  ◇          ║',
    '╠═════════════════════════╣',
    '║ ░░░░░░░░░░░░░░░░░░ ░    ║',
    '║ ▒▒▒▒▒▒▒▒▒▒▒░░░░░░░ ░    ║',
    '║ ▓▓▓▓▓▓▓▓░░░░░░░░░░ ░    ║',
    '║ ████████████████░░ ░    ║',
    '╠─────────────────────────╣',
    '║ ◐  ░░░░░░░░░░░          ║',
    '║ ◑  ░░░░░░░░░░  ✓        ║',
    '║ ◒  ░░░░░░░░░░  ✓        ║',
    '╠─────────────────────────╣',
    '║   ░░░░░  ▒▒▒  ▓▓▓       ║',
    '║   ·   ◇   ░░░░░░░  ◉    ║',
    '║   ·   ◈   ░░░░░░░  ◉    ║',
    '║   ·   ◆   ░░░░░░░  ◌    ║',
    '╚═════════════════════════╝',
  ];
  lines.forEach((line, idx) => {
    const lp = phase(prog, idx * 0.03, 0.3 + idx * 0.03);
    if (lp > 0) grid.text(x, y + idx, line.slice(0, Math.floor(line.length * lp)));
  });
}

export const promptops = {
  id: 'promptops',
  cols: COLS,
  rows: ROWS,
  duration: DUR,
  title: 'PROMPTOPS',
  subtitle: 'PROMPT STORAGE / VERSIONING / RETRIEVAL',
  draw(grid, t) {
    // Top bar
    drawTopBar(grid, t);

    // Prelude command typing 0.0–1.4s, fades during 1.4–1.8
    const preludeP = phase(t, 0.0, 1.4);
    const preludeFade = 1 - phase(t, 1.4, 1.8);
    if (preludeFade > 0.05) drawPrelude(grid, t, preludeP, preludeFade);

    // Tree panel 1.6–3.2s
    drawTreePanel(grid, t, easeInOut(phase(t, 1.6, 3.2)));

    // Right-side stats 2.0–3.4s
    drawStatsPanel(grid, t, phase(t, 2.0, 3.4));

    // Bottom command bar
    drawBottomBar(grid, t);

    // Abstract sigil overlay
    const sigilP = phase(t, 3.2, 3.7);
    if (sigilP > 0) {
      const line1 = '◇  ◈  ◆  ◈  ◇  ◈  ◆  ◈  ◇';
      const line2 = '░▒▓ ▓▒░  ·  ░▒▓ ▓▒░  ·  ░▒▓ ▓▒░';
      const x1 = Math.floor((COLS - line1.length) / 2);
      const x2 = Math.floor((COLS - line2.length) / 2);
      for (let i = 0; i < COLS; i++) grid.set(i, 35, ' ');
      for (let i = 0; i < COLS; i++) grid.set(i, 36, ' ');
      grid.text(x1, 35, line1.slice(0, Math.floor(line1.length * sigilP)));
      const subP = phase(t, 3.4, 3.9);
      if (subP > 0) grid.text(x2, 36, line2.slice(0, Math.floor(line2.length * subP)));
    }
  },
};
