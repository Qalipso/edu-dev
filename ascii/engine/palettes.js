// Character density palettes — index into by intensity 0..1
// Densest at end. Used to map fades/glow into ASCII brightness.

export const dim = ' .,:;`\'^';
export const light = ' .:-=+*';
export const stars = ' .·∙•*◦°';
export const sand = ' .·:˙·:.';
export const fire = ' .:!+*#%@';
export const water = ' .,~≈∿﹏';
export const cloud = ' .,~≈∿﹏ ';
export const vortex = ' .∿~≈6@%#';
export const paper = ' .─│┌┐└┘├┤┬┴┼';
export const graph = ' .oO●◌◍◎';
export const archive = ' .[]╔╗╚╝═║';
export const lamp = ' .:+*#%@';

// Trippy / ornamental palettes
export const ornament = ' .·∙•◦◇◈◆◉';
export const psy = ' .░▒▓█';
export const glyphs = ' ·∙◦◇◈◆◉◎●';
export const wave = ' .,~≈∿﹏─━═';
export const ink = ' ░▒▓█▓▒░';

// Pick char by intensity (0..1) from palette string
export function pick(palette, intensity) {
  if (intensity <= 0) return ' ';
  const i = Math.min(
    palette.length - 1,
    Math.max(0, Math.floor(intensity * palette.length))
  );
  return palette[i];
}
