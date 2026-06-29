import blessed from 'blessed';

import {
  HEALTH_INDICATOR_ASCII_MARKERS,
  HEALTH_INDICATOR_UNICODE_MARKERS,
  type RenderHealthIndicatorOptions,
  renderHealthIndicator,
} from '@/components/feedback/health-indicator/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the HealthIndicator adapter. */
export type HealthIndicatorBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link healthIndicator} adapter. */
export interface HealthIndicatorData
  extends Omit<RenderHealthIndicatorOptions, 'markers'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Semantic foreground token. Defaults to `'foreground'`. */
  foregroundTone?: keyof ThemeColors;

  /** Custom semantic markers. */
  markers?: RenderHealthIndicatorOptions['markers'];
}

/** Options accepted by the Blessed {@link healthIndicator} adapter. */
export interface HealthIndicatorOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: HealthIndicatorBoxOptions;

  /** Service health data, markers, capabilities, and theme data. */
  data: HealthIndicatorData;

  /** Blessed screen or node receiving the HealthIndicator. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link healthIndicator}. */
export type HealthIndicatorHandle = BlessedComponentHandle<
  HealthIndicatorData,
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
 * Creates a themed HealthIndicator backed by a Blessed box.
 *
 * The adapter chooses ASCII markers when Unicode is unavailable and leaves
 * `screen.render()` batching to callers.
 */
export function healthIndicator({
  box,
  data: initialData,
  parent,
}: HealthIndicatorOptions): HealthIndicatorHandle {
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
    const {
      backgroundTone,
      borderTone,
      capabilities: configuredCapabilities,
      foregroundTone,
      markers: configuredMarkers,
      theme,
      ...renderData
    } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const width = renderData.width ?? innerDimension(element.width, element.iwidth);
    const height = renderData.height ?? innerDimension(element.height, element.iheight);
    const markers =
      configuredMarkers ??
      (capabilities.unicode ? HEALTH_INDICATOR_UNICODE_MARKERS : HEALTH_INDICATOR_ASCII_MARKERS);

    element.setContent(
      renderHealthIndicator({
        ...renderData,
        ...(height === undefined ? {} : { height }),
        markers,
        ...(width === undefined || width === 0 ? {} : { width }),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone,
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
