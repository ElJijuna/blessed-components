export type ColorLevel = 0 | 1 | 2 | 3;

export interface ColorDetectionInput {
  env?: Readonly<Record<string, string | undefined>>;
  isTTY?: boolean;
}

/**
 * Detects terminal color level from explicit environment and TTY data.
 *
 * Levels follow the common convention: 0 none, 1 basic, 2 256-color, 3 truecolor.
 */
export function getColorLevel({
  env = process.env,
  isTTY = Boolean(process.stdout.isTTY),
}: ColorDetectionInput = {}): ColorLevel {
  if (!isTTY || env.NO_COLOR !== undefined || env.TERM === 'dumb') {
    return 0;
  }

  const colorTerm = env.COLORTERM?.toLowerCase();
  const term = env.TERM?.toLowerCase() ?? '';

  if (colorTerm === 'truecolor' || colorTerm === '24bit') {
    return 3;
  }

  if (term.includes('256color')) {
    return 2;
  }

  return 1;
}
