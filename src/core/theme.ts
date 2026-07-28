import type { ColorLevel } from './color.js';

export type TerminalColor = number | string;
export type ThemeDensity = 'compact' | 'comfortable' | 'spacious';
export type ThemeBorderStyle = 'background' | 'line' | 'none';

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
  character: string;
  style: ThemeBorderStyle;
}

export interface ThemeVariant {
  borders?: Partial<ThemeBorders>;
  colors?: ThemeColors;
  spacing?: Partial<ThemeSpacing>;
}

export interface Theme {
  /** Named variant selected for all consumers of this theme. */
  activeVariant?: string;
  borders?: Partial<ThemeBorders>;
  colors: ThemeColors;
  components: Record<string, Record<string, TerminalColor>>;
  density?: ThemeDensity;
  spacing?: Partial<ThemeSpacing>;
  variants?: Record<string, ThemeVariant>;
}

/** Fully materialized theme returned by {@link createTheme}. */
export interface ResolvedTheme extends Theme {
  borders: ThemeBorders;
  density: ThemeDensity;
  spacing: ThemeSpacing;
  variants: Record<string, ThemeVariant>;
}

export interface ThemeInput {
  activeVariant?: string;
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
  character: ' ',
  style: 'none',
});

export const DEFAULT_THEME: Readonly<ResolvedTheme> = Object.freeze({
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
export function createTheme(input: ThemeInput = {}): ResolvedTheme {
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
    ...(input.activeVariant === undefined ? {} : { activeVariant: input.activeVariant }),
    borders,
    colors,
    components,
    density,
    spacing,
    variants,
  };
}

export interface ResolveThemeTokensOptions {
  /** Component key used for `theme.components` color overrides. */
  component?: string;

  /** Variant key. Defaults to `theme.activeVariant`. */
  variant?: string;
}

export interface ResolvedThemeTokens {
  borders: ThemeBorders;
  colors: ThemeColors;
  spacing: ThemeSpacing;
}

/**
 * Resolves density defaults, component colors, and the active variant into
 * concrete tokens that adapters can apply.
 *
 * Precedence is: defaults → theme → component colors → active variant.
 */
export function resolveThemeTokens(
  theme: Theme = DEFAULT_THEME,
  { component, variant = theme.activeVariant }: ResolveThemeTokensOptions = {},
): ResolvedThemeTokens {
  const density = theme.density ?? DEFAULT_THEME.density;
  const selectedVariant = variant === undefined ? undefined : theme.variants?.[variant];

  return {
    borders: {
      ...DEFAULT_THEME_BORDERS,
      ...theme.borders,
      ...selectedVariant?.borders,
    },
    colors: {
      ...DEFAULT_THEME.colors,
      ...theme.colors,
      ...(component === undefined ? {} : theme.components[component]),
      ...selectedVariant?.colors,
    },
    spacing: {
      ...DENSITY_SPACING[density],
      ...theme.spacing,
      ...selectedVariant?.spacing,
    },
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
  return colorLevel === 0 ? undefined : resolveThemeTokens(theme).colors[token];
}

/**
 * Resolves component-level colors before falling back to semantic theme colors.
 */
export function resolveComponentThemeColor(
  theme: Theme,
  component: string,
  token: keyof ThemeColors,
  { colorLevel, variant }: { colorLevel: ColorLevel; variant?: string },
): TerminalColor | undefined {
  if (colorLevel === 0) {
    return undefined;
  }

  return resolveThemeTokens(theme, {
    component,
    ...(variant === undefined ? {} : { variant }),
  }).colors[token];
}
