import blessed from 'blessed';

import { resolveBoxTheme } from '@/components/layout/box/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import {
  resolveThemeTokens,
  type Theme,
  type ThemeColors,
  type ThemeSpacing,
} from '@/core/theme.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed options supported by the Box adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link box}.
 */
export type BoxElementOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Shared semantic style data accepted by themed Blessed adapters. */
export interface BoxData {
  /** Explicit color capability used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel'> | undefined;

  /** Semantic background token. @defaultValue `'background'` */
  backgroundTone?: keyof ThemeColors | undefined;

  /** Semantic border token. @defaultValue `'border'` */
  borderTone?: keyof ThemeColors | undefined;

  /** Semantic foreground token. @defaultValue `'foreground'` */
  foregroundTone?: keyof ThemeColors | undefined;

  /** Semantic terminal theme. */
  theme?: Theme | undefined;
}

/** Applies shared Box semantic styling to one existing Blessed element. */
export interface BoxStyleController {
  /** Resolves and applies complete replacement theme data. */
  apply(data?: BoxData): void;
}

/** Adapter context used to consume component and spacing theme tokens. */
export interface BoxStyleControllerOptions {
  /** Apply theme padding when Blessed padding is not explicit. */
  applyPadding?: boolean;

  /** Component key used for component-level color overrides. */
  component?: string;
}

interface RuntimeBorder extends blessed.Widgets.Border {
  bottom: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
}

type RuntimeBoxElement = Omit<blessed.Widgets.BoxElement, 'border'> & {
  border: RuntimeBorder | undefined;
  padding: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
};

function themePadding({ paddingX, paddingY }: ThemeSpacing): RuntimeBoxElement['padding'] {
  return {
    bottom: paddingY,
    left: paddingX,
    right: paddingX,
    top: paddingY,
  };
}

/**
 * Creates semantic style control for any Blessed box-based component.
 *
 * Explicit Blessed style, border, and padding values always win over semantic
 * theme values.
 */
export function createBoxStyleController(
  element: blessed.Widgets.BoxElement,
  elementOptions?: BoxElementOptions,
  defaults: BoxData = {},
  options: BoxStyleControllerOptions = {},
): BoxStyleController {
  const explicitForeground = elementOptions?.style?.fg;
  const explicitBackground = elementOptions?.style?.bg;
  const explicitBorder = elementOptions?.style?.border?.fg;
  const explicitBorderStructure = elementOptions?.border;
  const explicitPadding = elementOptions?.padding;
  const runtimeElement = element as RuntimeBoxElement;
  const initialBorder =
    runtimeElement.border === undefined ? undefined : { ...runtimeElement.border };
  const initialPadding = { ...runtimeElement.padding };

  return {
    apply(data = {}) {
      const capabilities = data.capabilities ?? defaults.capabilities ?? detectCapabilities();
      const backgroundTone = data.backgroundTone ?? defaults.backgroundTone;
      const borderTone = data.borderTone ?? defaults.borderTone;
      const foregroundTone = data.foregroundTone ?? defaults.foregroundTone;
      const theme = data.theme ?? defaults.theme;
      const tokens = resolveThemeTokens(theme, {
        ...(options.component === undefined ? {} : { component: options.component }),
      });
      const resolved = resolveBoxTheme({
        capabilities,
        ...(options.component === undefined ? {} : { component: options.component }),
        ...(backgroundTone === undefined ? {} : { backgroundTone }),
        ...(borderTone === undefined ? {} : { borderTone }),
        ...(foregroundTone === undefined ? {} : { foregroundTone }),
        ...(theme === undefined ? {} : { theme }),
      });

      if (explicitBorderStructure === undefined) {
        runtimeElement.border =
          theme === undefined
            ? initialBorder
            : tokens.borders.style === 'none'
              ? undefined
              : {
                  bottom: true,
                  ch: tokens.borders.character,
                  left: true,
                  right: true,
                  top: true,
                  type: tokens.borders.style === 'line' ? 'line' : 'bg',
                };
      }

      if (options.applyPadding === true && explicitPadding === undefined) {
        runtimeElement.padding =
          theme === undefined ? initialPadding : themePadding(tokens.spacing);
      }

      element.style.fg =
        explicitForeground ??
        (resolved.foreground === undefined ? undefined : String(resolved.foreground));
      element.style.bg =
        explicitBackground ??
        (resolved.background === undefined ? undefined : String(resolved.background));
      element.style.border = {
        ...element.style.border,
        fg: explicitBorder ?? (resolved.border === undefined ? undefined : String(resolved.border)),
      };
    },
  };
}

/** Options accepted by the Blessed {@link box} adapter. */
export interface BoxOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: BoxElementOptions;

  /** Semantic foreground, background, border, and theme configuration. */
  data?: BoxData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link box}. */
export type BoxHandle = BlessedComponentHandle<BoxData, blessed.Widgets.BoxElement>;

/**
 * Creates a composable themed Blessed box.
 *
 * Box owns no text layout and calls no `screen.render()`. Pass its `element`
 * as parent to nested components.
 */
export function box({
  box: elementOptions,
  data: initialData = {},
  parent,
}: BoxOptions): BoxHandle {
  let data = initialData;

  const element = blessed.box({
    ...elementOptions,
    content: '',
    parent,
    style: {
      ...elementOptions?.style,
      border: { ...elementOptions?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(
    element,
    elementOptions,
    {},
    {
      applyPadding: true,
      component: 'box',
    },
  );
  const render = (): void => style.apply(data);

  render();

  return {
    destroy() {
      element.destroy();
    },
    element,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
