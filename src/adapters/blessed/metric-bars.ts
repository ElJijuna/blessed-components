import blessed from 'blessed';

import {
  type MetricBarItem,
  type RenderMetricBarsOptions,
  renderMetricBars,
} from '../../components/metric-bars/index.js';

/**
 * Blessed box options supported by the MetricBars adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link metricBars}.
 */
export type MetricBarsBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Options accepted by the Blessed {@link metricBars} adapter. */
export interface MetricBarsOptions<TMetric extends MetricBarItem = MetricBarItem> {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: MetricBarsBoxOptions;

  /** Data passed to the pure {@link renderMetricBars} renderer. */
  data: RenderMetricBarsOptions<TMetric>;

  /** Blessed screen or node that receives the created box. */
  parent: blessed.Widgets.Node;
}

/**
 * Imperative handle returned by {@link metricBars}.
 *
 * The handle owns one box, never owns the parent screen, and never calls
 * `screen.render()`.
 */
export interface MetricBarsHandle<TMetric extends MetricBarItem = MetricBarItem> {
  /** Underlying Blessed box used for standard element operations. */
  readonly element: blessed.Widgets.BoxElement;

  /** Destroys and detaches the owned box without destroying its parent. */
  destroy(): void;

  /**
   * Replaces renderer data while preserving the Blessed element.
   *
   * @param data - Complete renderer data replacing the previous data.
   *
   * @throws `RangeError`
   * Propagates validation errors from {@link renderMetricBars}.
   */
  setData(data: RenderMetricBarsOptions<TMetric>): void;
}

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
  data,
  parent,
}: MetricBarsOptions<TMetric>): MetricBarsHandle<TMetric> {
  const element = blessed.box({
    ...box,
    content: renderMetricBars(data),
    parent,
    tags: false,
  });

  return {
    element,
    destroy() {
      element.destroy();
    },
    setData(nextData) {
      element.setContent(renderMetricBars(nextData));
    },
  };
}
