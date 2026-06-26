import blessed from 'blessed';

import {
  type RenderTrendOptions,
  renderTrend,
  type TrendDirection,
} from '@/components/data-display/trend/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Trend adapter. */
export type TrendBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link trend} adapter. */
export interface TrendData extends RenderTrendOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. Defaults to a tone derived from direction. */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link trend} adapter. */
export interface TrendOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: TrendBoxOptions;

  /** Trend direction, value, layout policy, theme, and semantic tone. */
  data: TrendData;

  /** Blessed screen or node receiving the Trend. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link trend}. */
export type TrendHandle = BlessedComponentHandle<TrendData, blessed.Widgets.BoxElement>;

function toneForDirection(direction: TrendDirection): keyof ThemeColors {
  return direction === 'up' ? 'success' : direction === 'down' ? 'danger' : 'muted';
}

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
 * Creates a display-only Trend backed by a Blessed box.
 *
 * The adapter derives a missing width from the element's inner size, applies a
 * direction-derived semantic foreground by default, disables Blessed tags, and
 * leaves `screen.render()` batching to callers.
 */
export function trend({ box, data: initialData, parent }: TrendOptions): TrendHandle {
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
    const width = renderData.width ?? innerDimension(element.width, element.iwidth);
    const height = innerDimension(element.height, element.iheight);

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone ?? toneForDirection(renderData.direction),
      theme,
    });

    if (width === 0 || height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderTrend({
        ...renderData,
        ...(width === undefined ? {} : { width }),
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
