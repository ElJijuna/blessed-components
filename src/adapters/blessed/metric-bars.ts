import blessed from 'blessed';

import {
  type MetricBarItem,
  type RenderMetricBarsOptions,
  renderMetricBars,
} from '../../components/visualization/metric-bars/index.js';
import type { ThemeColors } from '../../core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by the MetricBars adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link metricBars}.
 */
export type MetricBarsBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link metricBars} adapter. */
export interface MetricBarsData<TMetric extends MetricBarItem = MetricBarItem>
  extends RenderMetricBarsOptions<TMetric>,
    Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link metricBars} adapter. */
export interface MetricBarsOptions<TMetric extends MetricBarItem = MetricBarItem> {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: MetricBarsBoxOptions;

  /** Data passed to the pure {@link renderMetricBars} renderer. */
  data: MetricBarsData<TMetric>;

  /** Blessed screen or node that receives the created box. */
  parent: blessed.Widgets.Node;
}

/**
 * Imperative handle returned by {@link metricBars}.
 *
 * The handle owns one box, never owns the parent screen, and never calls
 * `screen.render()`.
 */
export type MetricBarsHandle<TMetric extends MetricBarItem = MetricBarItem> =
  BlessedComponentHandle<MetricBarsData<TMetric>, blessed.Widgets.BoxElement>;

/**
 * Creates display-only MetricBars backed by a Blessed `BoxElement`.
 *
 * Import from `blessed-components/metric-bars/blessed`. The adapter disables
 * Blessed tags, updates content through {@link renderMetricBars}, and leaves
 * terminal rendering under caller control.
 *
 * @typeParam TMetric - Metric shape, including optional application metadata.
 * @param options - Parent node, renderer data, and optional box settings.
 * @returns Handle for the created box, updates, and cleanup.
 *
 * @throws `RangeError`
 * Propagates validation errors from {@link renderMetricBars}.
 *
 * @example
 *
 * ```ts
 * import blessed from 'blessed';
 * import { metricBars } from 'blessed-components/metric-bars/blessed';
 *
 * const screen = blessed.screen({ smartCSR: true });
 * const score = metricBars({
 *   parent: screen,
 *   box: { top: 0, left: 0, width: 60, height: 5 },
 *   data: {
 *     barWidth: 16,
 *     label: 'Overall',
 *     value: '85%',
 *     metrics: [
 *       { label: 'Quality', value: 78 },
 *       { label: 'Popularity', value: 99 },
 *     ],
 *   },
 * });
 *
 * screen.render();
 * score.destroy();
 * screen.destroy();
 * ```
 */
export function metricBars<TMetric extends MetricBarItem>({
  box,
  data: initialData,
  parent,
}: MetricBarsOptions<TMetric>): MetricBarsHandle<TMetric> {
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

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone,
      theme,
    });
    element.setContent(renderMetricBars(renderData));
  };

  render();

  return {
    element,
    destroy() {
      element.destroy();
    },
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
