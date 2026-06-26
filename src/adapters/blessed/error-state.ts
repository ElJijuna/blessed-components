import blessed from 'blessed';

import {
  type RenderErrorStateOptions,
  renderErrorState,
} from '@/components/feedback/error-state/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the ErrorState adapter. */
export type ErrorStateBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link errorState} adapter. */
export interface ErrorStateData extends RenderErrorStateOptions, Omit<BoxData, 'foregroundTone'> {
  /**
   * Semantic foreground token.
   *
   * @defaultValue `'danger'`
   */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link errorState} adapter. */
export interface ErrorStateOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: ErrorStateBoxOptions;

  /** Error-state content, layout, and theme data. */
  data: ErrorStateData;

  /** Blessed screen or node receiving the ErrorState. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link errorState}. */
export type ErrorStateHandle = BlessedComponentHandle<ErrorStateData, blessed.Widgets.BoxElement>;

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
 * Creates a display-only ErrorState backed by a Blessed box.
 *
 * The adapter derives missing renderer dimensions from the element's inner
 * size, applies danger semantic color by default, and leaves screen rendering
 * under caller control.
 */
export function errorState({
  box,
  data: initialData,
  parent,
}: ErrorStateOptions): ErrorStateHandle {
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
      renderErrorState({
        ...renderData,
        ...(height === undefined ? {} : { height }),
        ...(width === undefined || width === 0 ? {} : { width }),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone: borderTone ?? 'danger',
      capabilities,
      foregroundTone: tone ?? 'danger',
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
