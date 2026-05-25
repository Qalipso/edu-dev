// AI EVAL — waveform interference scope
// Distinct identity: HORIZONTAL oscilloscope, NO central focal radial.
// Two competing waveforms (top + bottom halves) → meet at center → interfere →
// lock into stable interference pattern (verified). Pure wave language.
import { phase, easeInOut, easeOut, seeded } from '../engine/easing.js';
import { pick, ornament, psy, glyphs } from '../engine/palettes.js';
import { waveform, interference, plasma } from '../engine/trippy.js';

const COLS = 140;
const ROWS = 38;
const DUR = 4.0;

// Scope frame — horizontal channel boundaries
function drawScope(grid, prog) {
  if (prog <= 0) return;
  // Top channel ceiling
  const drawn = Math.floor(COLS * prog);
  for (let x = 0; x < drawn; x++) {
    grid.set(x, 4, '─');
    grid.set(x, 33, '─');
  }
  // Center reference line (dotted)
  for (let x = 0; x < drawn; x++) {
    if (x % 4 === 0) grid.set(x, 18, '·');
    if (x % 12 === 0) grid.set(x, 18, '┼');
  }
  // Side scale ticks
  if (prog > 0.5) {
    for (let y = 5; y < 33; y += 2) {
      grid.set(0, y, '├');
      grid.set(COLS - 1, y, '┤');
    }
  }
  // Channel labels (abstract)
  if (prog > 0.7) {
    grid.text(2, 5, '◇ CH-A');
    grid.text(2, 31, '◆ CH-B');
    grid.text(COLS - 9, 5, 'CH-A ◇');
    grid.text(COLS - 9, 31, 'CH-B ◆');
  }
}

function drawSigil(grid, t, prog) {
  if (prog <= 0) return;
  const lines = [
    '◇ ◈ ◆ ◈ ◇   ◇ ◈ ◆ ◈ ◇',
    '░▒▓ ▓▒░ · ░▒▓ ▓▒░',
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

export const aiEval = {
  id: 'ai-eval',
  cols: COLS,
  rows: ROWS,
  duration: DUR,
  title: 'AI EVAL',
  subtitle: 'MEASURED · COMPARED · VERIFIED',
  draw(grid, t) {
    // Faint plasma background (channel grid noise)
    plasma(grid, t * 0.5, ' .', { intensity: 0.3, scale: 0.1 });

    // PHASE 1: top channel waveform appears 0.0–1.2s
    const topP = easeOut(phase(t, 0.0, 1.2));
    if (topP > 0) {
      waveform(grid, 11, t, {
        amp: 4, freq: 0.22, phaseShift: 0,
        color: '◇', drawn: topP,
        xStart: 4, xEnd: COLS - 4,
      });
      waveform(grid, 11, t * 1.1, {
        amp: 3, freq: 0.35, phaseShift: 1.5,
        color: '·', drawn: topP,
        xStart: 4, xEnd: COLS - 4,
      });
    }

    // PHASE 2: bottom channel waveform 0.5–1.6s
    const botP = easeOut(phase(t, 0.5, 1.6));
    if (botP > 0) {
      waveform(grid, 26, t * 0.9, {
        amp: 4, freq: 0.27, phaseShift: 2.0,
        color: '◆', drawn: botP,
        xStart: 4, xEnd: COLS - 4,
      });
      waveform(grid, 26, t * 1.3, {
        amp: 3, freq: 0.4, phaseShift: 0.5,
        color: '·', drawn: botP,
        xStart: 4, xEnd: COLS - 4,
      });
    }

    // PHASE 3: center interference channel 1.4–2.8s
    const interP = easeOut(phase(t, 1.4, 2.8));
    if (interP > 0) {
      // Erratic during pour-equivalent then stabilize
      const ampMod = 1 + Math.sin(t * 6) * 0.3 * (1 - phase(t, 2.4, 2.8));
      interference(grid, 18, t, {
        amp1: 5 * ampMod, amp2: 5 * ampMod,
        freq1: 0.22, freq2: 0.27,
        intensity: interP,
        palette: ' ·∙◦●◉',
        xStart: 4, xEnd: COLS - 4,
      });
    }

    // PHASE 4: stable locked waveform on top of center 2.8–3.6
    const lockP = easeOut(phase(t, 2.8, 3.6));
    if (lockP > 0) {
      // Solid locked sine through center
      waveform(grid, 18, t * 0.4, {
        amp: 3, freq: 0.18,
        color: '◉', drawn: lockP,
        xStart: 4, xEnd: COLS - 4,
      });
    }

    // Scope frame
    drawScope(grid, easeOut(phase(t, 0.6, 2.2)));

    // Bottom sigil
    const sigilP = phase(t, 3.0, 3.6);
    if (sigilP > 0) drawSigil(grid, t, sigilP);
  },
};
