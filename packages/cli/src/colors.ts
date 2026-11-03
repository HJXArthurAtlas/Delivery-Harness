// Shared terminal colors for pack/self-update banners. Sampled from the
// design references: orange (233,158,76), gray (110,113,122) → nearest
// xterm-256. macOS Terminal.app has no truecolor, so 256-color is the safe
// denominator.

export const ANSI_ORANGE = 179;
export const ANSI_GRAY = 243;
// Checkmark green: bright cluster (170,179,100) of the reference (which is
// low-res and dark-compressed; the bright core matches the demo's look).
export const ANSI_GREEN = 143;

export function paint(colorCode: number, text: string): string {
  if (process.stdout.isTTY !== true || process.env.NO_COLOR || process.env.TERM === 'dumb') {
    return text;
  }
  return `\x1b[38;5;${colorCode}m${text}\x1b[0m`;
}
