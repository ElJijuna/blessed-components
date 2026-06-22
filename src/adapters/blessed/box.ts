import blessed from 'blessed';

import { type ResolveBoxThemeOptions, resolveBoxTheme } from '../../components/layout/box/index.js';
import { detectCapabilities, type TerminalCapabilities } from '../../core/capabilities.js';
import type { Theme } from '../../core/theme.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed options supported by the Box adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link box}.
 */
export type BoxElementOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful semantic style data accepted by {@link box}. */
export interface BoxData extends Omit<ResolveBoxThemeOptions, 'capabilities' | 'theme'> {
  /** Explicit color capability used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel'>;

  /** Semantic terminal theme. */
  theme?: Theme;
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

  const explicitForeground = elementOptions?.style?.fg;
  const explicitBackground = elementOptions?.style?.bg;
  const explicitBorder = elementOptions?.style?.border?.fg;
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
  const render = (): void => {
    const { capabilities = detectCapabilities(), theme, ...tones } = data;
    const resolved = resolveBoxTheme({
      ...tones,
      capabilities,
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
  };

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
