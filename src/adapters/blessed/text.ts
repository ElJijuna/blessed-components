import blessed from 'blessed';

import { type RenderTextOptions, renderText } from '../../components/data-display/text/index.js';
import { detectCapabilities, type TerminalCapabilities } from '../../core/capabilities.js';
import {
  DEFAULT_THEME,
  resolveThemeColor,
  type Theme,
  type ThemeColors,
} from '../../core/theme.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by the Text adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link text}.
 */
export type TextBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/**
 * Stateful data accepted by the Blessed {@link text} adapter.
 */
export interface TextData extends RenderTextOptions {
  /**
   * Explicit color capability used for deterministic rendering.
   *
   * When omitted, capabilities are detected from the running process.
   */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel'>;

  /**
   * Semantic terminal theme.
   *
   * @defaultValue `DEFAULT_THEME`
   */
  theme?: Theme;

  /**
   * Semantic foreground token.
   *
   * @defaultValue `'foreground'`
   */
  tone?: keyof ThemeColors;
}

/**
 * Options accepted by the Blessed {@link text} adapter.
 */
export interface TextOptions {
  /** Position, dimensions, style, and regular Blessed box settings. */
  box?: TextBoxOptions;

  /** Text content, layout policy, theme, and semantic tone. */
  data: TextData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/**
 * Imperative handle returned by {@link text}.
 */
export type TextHandle = BlessedComponentHandle<TextData, blessed.Widgets.BoxElement>;

function numericDimension(value: blessed.Widgets.Types.TPosition): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined;
}

function innerDimension(
  outer: blessed.Widgets.Types.TPosition,
  inset: blessed.Widgets.Types.TPosition,
): number | undefined {
  const outerSize = numericDimension(outer);

  return outerSize === undefined
    ? undefined
    : Math.max(0, outerSize - (numericDimension(inset) ?? 0));
}

/**
 * Creates display-only Text backed by a Blessed box.
 *
 * The adapter derives missing renderer dimensions from the element's inner
 * size, applies semantic foreground color through Blessed style, disables
 * Blessed tags, and leaves `screen.render()` under caller control.
 *
 * @param options - Parent node, renderer data, and optional box settings.
 * @returns Handle for content updates and cleanup.
 */
export function text({ box, data: initialData, parent }: TextOptions): TextHandle {
  let data = initialData;

  const explicitForeground = box?.style?.fg;
  const element = blessed.box({
    ...box,
    content: '',
    parent,
    style: { ...box?.style },
    tags: false,
  });
  const render = (): void => {
    const detected = data.capabilities ?? detectCapabilities();
    const theme = data.theme ?? DEFAULT_THEME;
    const tone = data.tone ?? 'foreground';
    const semanticForeground = resolveThemeColor(theme, tone, detected);
    const width = data.width ?? innerDimension(element.width, element.iwidth) ?? 0;
    const height = data.height ?? innerDimension(element.height, element.iheight);

    element.style.fg =
      explicitForeground ??
      (semanticForeground === undefined ? undefined : String(semanticForeground));

    if (width === 0 || height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderText({
        ...data,
        ...(height === undefined ? {} : { height }),
        width,
      }),
    );
  };

  render();
  element.on('resize', render);

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
