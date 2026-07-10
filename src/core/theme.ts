import type { ColorLevel } from './color.js';

export type TerminalColor = number | string;
export type ThemeDensity = 'compact' | 'comfortable' | 'spacious';
export type ThemeBorderStyle = 'none' | 'single' | 'double' | 'heavy';

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

export interface ThemeSpacing {
  gap: number;
  itemGap: number;
  paddingX: number;
  paddingY: number;
}

export interface ThemeBorders {
  focus?: TerminalColor;
  radius: number;
  style: ThemeBorderStyle;
}

export interface ThemeVariant {
  borders?: Partial<ThemeBorders>;
  colors?: ThemeColors;
  spacing?: Partial<ThemeSpacing>;
}

export interface Theme {
  borders: ThemeBorders;
  colors: ThemeColors;
  density: ThemeDensity;
  components: Record<string, Record<string, TerminalColor>>;
  spacing: ThemeSpacing;
  variants: Record<string, ThemeVariant>;
}

export interface ThemeInput {
  borders?: Partial<ThemeBorders>;
  colors?: ThemeColors;
  components?: Record<string, Record<string, TerminalColor>>;
  density?: ThemeDensity;
  highContrast?: boolean;
  spacing?: Partial<ThemeSpacing>;
  variants?: Record<string, ThemeVariant>;
}

export const DEFAULT_THEME_SPACING: Readonly<ThemeSpacing> = Object.freeze({
  gap: 1,
  itemGap: 0,
  paddingX: 1,
  paddingY: 0,
});

export const DENSITY_SPACING: Readonly<Record<ThemeDensity, ThemeSpacing>> = Object.freeze({
  compact: Object.freeze({ gap: 0, itemGap: 0, paddingX: 0, paddingY: 0 }),
  comfortable: DEFAULT_THEME_SPACING,
  spacious: Object.freeze({ gap: 2, itemGap: 1, paddingX: 2, paddingY: 1 }),
});

export const DEFAULT_THEME_BORDERS: Readonly<ThemeBorders> = Object.freeze({
  focus: 'cyan',
  radius: 0,
  style: 'single',
});

export const DEFAULT_THEME: Readonly<Theme> = Object.freeze({
  borders: DEFAULT_THEME_BORDERS,
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
  density: 'comfortable',
  spacing: DEFAULT_THEME_SPACING,
  variants: Object.freeze({}),
});

export const HIGH_CONTRAST_THEME_COLORS: Readonly<ThemeColors> = Object.freeze({
  background: 'black',
  border: 'white',
  danger: 'bright-red',
  foreground: 'bright-white',
  info: 'bright-cyan',
  muted: 'white',
  primary: 'bright-cyan',
  success: 'bright-green',
  warning: 'bright-yellow',
});

/**
 * Creates a semantic terminal theme with layout, border, component, and variant tokens.
 */
export function createTheme(input: ThemeInput = {}): Theme {
  const density = input.density ?? DEFAULT_THEME.density;
  const spacing = {
    ...DENSITY_SPACING[density],
    ...input.spacing,
  };
  const borders = {
    ...DEFAULT_THEME.borders,
    ...input.borders,
  };
  const colors = {
    ...DEFAULT_THEME.colors,
    ...(input.highContrast === true ? HIGH_CONTRAST_THEME_COLORS : {}),
    ...input.colors,
  };
  const components = Object.fromEntries(
    Object.entries(input.components ?? {}).map(([name, values]) => [name, { ...values }]),
  );
  const variants = Object.fromEntries(
    Object.entries(input.variants ?? {}).map(([name, values]) => {
      const variant: ThemeVariant = {};

      if (values.borders !== undefined) {
        variant.borders = { ...values.borders };
      }

      if (values.colors !== undefined) {
        variant.colors = { ...values.colors };
      }

      if (values.spacing !== undefined) {
        variant.spacing = { ...values.spacing };
      }

      return [name, variant];
    }),
  );

  return {
    borders,
    colors,
    components,
    density,
    spacing,
    variants,
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

/**
 * Resolves component-level colors before falling back to semantic theme colors.
 */
export function resolveComponentThemeColor(
  theme: Theme,
  component: string,
  token: keyof ThemeColors,
  { colorLevel }: { colorLevel: ColorLevel },
): TerminalColor | undefined {
  if (colorLevel === 0) {
    return undefined;
  }

  return theme.components[component]?.[token] ?? theme.colors[token];
}
