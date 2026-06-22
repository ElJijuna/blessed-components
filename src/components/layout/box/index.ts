import type { TerminalCapabilities } from '@/core/capabilities.js';
import {
  DEFAULT_THEME,
  resolveThemeColor,
  type TerminalColor,
  type Theme,
  type ThemeColors,
} from '@/core/theme.js';

/** Semantic theme configuration accepted by {@link resolveBoxTheme}. */
export interface ResolveBoxThemeOptions {
  /** Explicit terminal color capability. */
  capabilities: Pick<TerminalCapabilities, 'colorLevel'>;

  /** Semantic background token. @defaultValue `'background'` */
  backgroundTone?: keyof ThemeColors;

  /** Semantic border token. @defaultValue `'border'` */
  borderTone?: keyof ThemeColors;

  /** Semantic foreground token. @defaultValue `'foreground'` */
  foregroundTone?: keyof ThemeColors;

  /** Semantic terminal theme. @defaultValue `DEFAULT_THEME` */
  theme?: Theme;
}

/** Resolved semantic colors for a Box. */
export interface BoxThemeStyle {
  /** Resolved background color, or undefined in no-color mode. */
  background: TerminalColor | undefined;

  /** Resolved border color, or undefined in no-color mode. */
  border: TerminalColor | undefined;

  /** Resolved foreground color, or undefined in no-color mode. */
  foreground: TerminalColor | undefined;
}

/**
 * Resolves semantic Box colors without importing Blessed.
 *
 * All colors become undefined when terminal color support is unavailable.
 */
export function resolveBoxTheme({
  backgroundTone = 'background',
  borderTone = 'border',
  capabilities,
  foregroundTone = 'foreground',
  theme = DEFAULT_THEME,
}: ResolveBoxThemeOptions): BoxThemeStyle {
  return {
    background: resolveThemeColor(theme, backgroundTone, capabilities),
    border: resolveThemeColor(theme, borderTone, capabilities),
    foreground: resolveThemeColor(theme, foregroundTone, capabilities),
  };
}
