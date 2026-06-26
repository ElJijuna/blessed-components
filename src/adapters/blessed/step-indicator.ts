import blessed from 'blessed';

import {
  type RenderStepIndicatorOptions,
  renderStepIndicator,
  STEP_INDICATOR_ASCII_MARKERS,
  STEP_INDICATOR_UNICODE_MARKERS,
} from '@/components/feedback/step-indicator/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the StepIndicator adapter. */
export type StepIndicatorBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link stepIndicator} adapter. */
export interface StepIndicatorData
  extends Omit<RenderStepIndicatorOptions, 'markers'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom state markers. */
  markers?: RenderStepIndicatorOptions['markers'];

  /**
   * Semantic foreground token.
   *
   * @defaultValue `'foreground'`
   */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link stepIndicator} adapter. */
export interface StepIndicatorOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: StepIndicatorBoxOptions;

  /** Step content, layout, capabilities, and theme data. */
  data: StepIndicatorData;

  /** Blessed screen or node receiving the StepIndicator. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link stepIndicator}. */
export type StepIndicatorHandle = BlessedComponentHandle<
  StepIndicatorData,
  blessed.Widgets.BoxElement
>;

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
 * Creates a display-only StepIndicator backed by a Blessed box.
 *
 * The adapter derives missing renderer dimensions from the element's inner
 * size, chooses ASCII markers when Unicode is unavailable, and leaves screen
 * rendering under caller control.
 */
export function stepIndicator({
  box,
  data: initialData,
  parent,
}: StepIndicatorOptions): StepIndicatorHandle {
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
    const { backgroundTone, borderTone, capabilities: configuredCapabilities, theme, tone } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const markers =
      data.markers ??
      (capabilities.unicode ? STEP_INDICATOR_UNICODE_MARKERS : STEP_INDICATOR_ASCII_MARKERS);
    const width = data.width ?? innerDimension(element.width, element.iwidth);
    const height = data.height ?? innerDimension(element.height, element.iheight);

    element.setContent(
      renderStepIndicator({
        ...data,
        ...(height === undefined ? {} : { height }),
        markers,
        ...(width === undefined || width === 0 ? {} : { width }),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: tone,
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
