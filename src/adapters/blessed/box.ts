import blessed from 'blessed';

import { resolveBoxTheme } from '@/components/layout/box/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { Theme, ThemeColors } from '@/core/theme.js';
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

/**
 * Creates semantic style control for any Blessed box-based component.
 *
 * Explicit Blessed style values always win over semantic theme values.
 */
export function createBoxStyleController(
  element: blessed.Widgets.BoxElement,
  elementOptions?: BoxElementOptions,
  defaults: BoxData = {},
): BoxStyleController {
  const explicitForeground = elementOptions?.style?.fg;
  const explicitBackground = elementOptions?.style?.bg;
  const explicitBorder = elementOptions?.style?.border?.fg;

  return {
    apply(data = {}) {
      const capabilities = data.capabilities ?? defaults.capabilities ?? detectCapabilities();
      const backgroundTone = data.backgroundTone ?? defaults.backgroundTone;
      const borderTone = data.borderTone ?? defaults.borderTone;
      const foregroundTone = data.foregroundTone ?? defaults.foregroundTone;
      const theme = data.theme ?? defaults.theme;
      const resolved = resolveBoxTheme({
        capabilities,
        ...(backgroundTone === undefined ? {} : { backgroundTone }),
        ...(borderTone === undefined ? {} : { borderTone }),
        ...(foregroundTone === undefined ? {} : { foregroundTone }),
        ...(theme === undefined ? {} : { theme }),
      });

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
  const style = createBoxStyleController(element, elementOptions);
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
