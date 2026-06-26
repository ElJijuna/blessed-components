import blessed from 'blessed';

import {
  type RenderEmptyStateOptions,
  renderEmptyState,
} from '@/components/feedback/empty-state/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the EmptyState adapter. */
export type EmptyStateBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link emptyState} adapter. */
export interface EmptyStateData extends RenderEmptyStateOptions, Omit<BoxData, 'foregroundTone'> {
  /**
   * Semantic foreground token.
   *
   * @defaultValue `'muted'`
   */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link emptyState} adapter. */
export interface EmptyStateOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: EmptyStateBoxOptions;

  /** Empty-state content, layout, and theme data. */
  data: EmptyStateData;

  /** Blessed screen or node receiving the EmptyState. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link emptyState}. */
export type EmptyStateHandle = BlessedComponentHandle<EmptyStateData, blessed.Widgets.BoxElement>;

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
 * Creates a display-only EmptyState backed by a Blessed box.
 *
 * The adapter derives missing renderer dimensions from the element's inner
 * size, applies muted semantic color by default, and leaves screen rendering
 * under caller control.
 */
export function emptyState({
  box,
  data: initialData,
  parent,
}: EmptyStateOptions): EmptyStateHandle {
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
    const height = renderData.height ?? innerDimension(element.height, element.iheight);

    element.setContent(
      renderEmptyState({
        ...renderData,
        ...(height === undefined ? {} : { height }),
        ...(width === undefined || width === 0 ? {} : { width }),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone ?? 'muted',
      theme,
    });
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
