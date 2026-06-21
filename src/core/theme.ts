import type { ColorLevel } from './color.js';

export type TerminalColor = number | string;

export interface ThemeColors {
  background?: TerminalColor;
  border?: TerminalColor;
  danger?: TerminalColor;
  foreground?: TerminalColor;
  info?: TerminalColor;
  muted?: TerminalColor;
  primary?: TerminalColor;
  success?: TerminalColor;
  warning?: TerminalColor;
}

export interface Theme {
  colors: ThemeColors;
  components: Record<string, Record<string, TerminalColor>>;
}

export interface ThemeInput {
  colors?: ThemeColors;
  components?: Record<string, Record<string, TerminalColor>>;
}

export const DEFAULT_THEME: Readonly<Theme> = Object.freeze({
  colors: Object.freeze({
    border: 'grey',
    danger: 'red',
    foreground: 'white',
    info: 'cyan',
    muted: 'grey',
    primary: 'cyan',
    success: 'green',
    warning: 'yellow',
  }),
  components: Object.freeze({}),
});

/**
 * Creates a semantic terminal theme with component-level overrides.
 */
export function createTheme(input: ThemeInput = {}): Theme {
  const components = Object.fromEntries(
    Object.entries(input.components ?? {}).map(([name, values]) => [name, { ...values }]),
  );

  return {
    colors: { ...DEFAULT_THEME.colors, ...input.colors },
    components,
  };
}

/**
 * Resolves a semantic color only when terminal color output is available.
 */
export function resolveThemeColor(
  theme: Theme,
  token: keyof ThemeColors,
  { colorLevel }: { colorLevel: ColorLevel },
): TerminalColor | undefined {
  return colorLevel === 0 ? undefined : theme.colors[token];
}
