import { type ColorLevel, getColorLevel } from './color.js';

export interface TerminalCapabilities {
  colorLevel: ColorLevel;
  mouse: boolean;
  unicode: boolean;
}

export interface DetectCapabilitiesOptions {
  env?: Readonly<Record<string, string | undefined>>;
  isTTY?: boolean;
  platform?: NodeJS.Platform;
}

/**
 * Detects terminal capabilities from explicit process-like inputs.
 *
 * Accepting inputs keeps detection deterministic in tests and remote sessions.
 */
export function detectCapabilities({
  env = process.env,
  isTTY = Boolean(process.stdout.isTTY),
  platform = process.platform,
}: DetectCapabilitiesOptions = {}): TerminalCapabilities {
  const term = env.TERM?.toLowerCase() ?? '';
  const unicode =
    isTTY &&
    term !== 'dumb' &&
    (platform !== 'win32' ||
      env.WT_SESSION !== undefined ||
      env.TERM_PROGRAM !== undefined ||
      env.ConEmuANSI === 'ON');

  return {
    colorLevel: getColorLevel({ env, isTTY }),
    mouse: isTTY && term !== 'dumb',
    unicode,
  };
}
