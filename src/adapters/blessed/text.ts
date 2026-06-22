import blessed from 'blessed';

import { type RenderTextOptions, renderText } from '../../components/data-display/text/index.js';
import type { ThemeColors } from '../../core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
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
export interface TextData extends RenderTextOptions, Omit<BoxData, 'foregroundTone'> {
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

  const element = blessed.box({
    ...box,
    content: '',
    parent,
    style: {
      ...box?.style,
      border: { ...box?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, box);
  const render = (): void => {
    const { backgroundTone, borderTone, capabilities, theme, tone, ...renderData } = data;
    const width = renderData.width ?? innerDimension(element.width, element.iwidth) ?? 0;
    const height = renderData.height ?? innerDimension(element.height, element.iheight);

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone,
      theme,
    });

    if (width === 0 || height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderText({
        ...renderData,
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
