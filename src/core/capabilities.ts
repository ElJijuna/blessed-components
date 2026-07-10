import { type ColorLevel, getColorLevel } from './color.js';

export interface TerminalCapabilities {
  colorLevel: ColorLevel;
  mouse: boolean;
  unicode: boolean;
}

export type TerminalCapabilityProfile = 'ascii' | 'basic' | 'dumb' | 'rich';

export interface DetectCapabilitiesOptions {
  env?: Readonly<Record<string, string | undefined>>;
  isTTY?: boolean;
  platform?: NodeJS.Platform;
}

export interface CapabilityMatrixScenario extends DetectCapabilitiesOptions {
  id: string;
  label: string;
}

export interface CapabilityMatrixEntry {
  capabilities: TerminalCapabilities;
  characterMode: 'ascii' | 'unicode';
  profile: TerminalCapabilityProfile;
  scenario: CapabilityMatrixScenario;
}

export const DEFAULT_CAPABILITY_MATRIX_SCENARIOS: readonly CapabilityMatrixScenario[] =
  Object.freeze([
    Object.freeze({
      env: { TERM: 'dumb' },
      id: 'dumb',
      isTTY: true,
      label: 'Dumb terminal',
      platform: 'linux',
    }),
    Object.freeze({
      env: { NO_COLOR: '1', TERM: 'xterm' },
      id: 'no-color',
      isTTY: true,
      label: 'No color',
      platform: 'linux',
    }),
    Object.freeze({
      env: { TERM: 'xterm' },
      id: 'windows-ascii',
      isTTY: true,
      label: 'Windows ASCII fallback',
      platform: 'win32',
    }),
    Object.freeze({
      env: { TERM: 'xterm-256color' },
      id: 'xterm-256',
      isTTY: true,
      label: '256 color TTY',
      platform: 'linux',
    }),
    Object.freeze({
      env: { COLORTERM: 'truecolor', TERM: 'xterm-256color' },
      id: 'truecolor',
      isTTY: true,
      label: 'Truecolor TTY',
      platform: 'linux',
    }),
  ]);

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

/**
 * Selects the safest character mode for detected terminal capabilities.
 */
export function selectCharacterMode(
  capabilities: Pick<TerminalCapabilities, 'unicode'>,
): 'ascii' | 'unicode' {
  return capabilities.unicode ? 'unicode' : 'ascii';
}

/**
 * Groups capabilities into a coarse profile useful for docs, demos, and QA matrices.
 */
export function selectCapabilityProfile({
  colorLevel,
  mouse,
  unicode,
}: TerminalCapabilities): TerminalCapabilityProfile {
  if (colorLevel === 0 && !mouse && !unicode) {
    return 'dumb';
  }

  if (!unicode) {
    return 'ascii';
  }

  return colorLevel >= 2 && mouse ? 'rich' : 'basic';
}

/**
 * Builds a deterministic terminal capability matrix for validation and documentation.
 */
export function createCapabilityMatrix(
  scenarios: readonly CapabilityMatrixScenario[] = DEFAULT_CAPABILITY_MATRIX_SCENARIOS,
): CapabilityMatrixEntry[] {
  return scenarios.map((scenario) => {
    const capabilities = detectCapabilities(scenario);

    return {
      capabilities,
      characterMode: selectCharacterMode(capabilities),
      profile: selectCapabilityProfile(capabilities),
      scenario: {
        ...scenario,
        env: { ...scenario.env },
      },
    };
  });
}
