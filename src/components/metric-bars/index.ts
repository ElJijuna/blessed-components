import {
  type ProgressBarCharacters,
  type ProgressBarValueContext,
  renderProgressBar,
} from '../progress-bar/index.js';

/**
 * Minimum data required for one MetricBars row.
 *
 * Applications may add arbitrary typed metadata for use by
 * {@link RenderMetricBarsOptions.formatValue}.
 */
export interface MetricBarItem {
  /** Human-readable row label. */
  label: string;

  /** Additional application-specific metric metadata. */
  [key: string]: unknown;

  /** Finite numeric value mapped into the shared domain. */
  value: number;
}

/**
 * Value formatter context for one metric row.
 */
export interface MetricBarValueContext<TMetric extends MetricBarItem>
  extends ProgressBarValueContext {
  /** Original metric object supplied by the caller. */
  metric: TMetric;
}

/**
 * Options accepted by {@link renderMetricBars}.
 *
 * Every row shares one domain, track width, and character pair. Labels are
 * padded to the longest label before each row is delegated to
 * {@link renderProgressBar}.
 */
export interface RenderMetricBarsOptions<TMetric extends MetricBarItem = MetricBarItem> {
  /** Positive integer width of every progress track. */
  barWidth: number;

  /**
   * Shared filled and empty track characters.
   *
   * @defaultValue `{ filled: '█', empty: '░' }`
   */
  characters?: ProgressBarCharacters;

  /**
   * Text returned when `metrics` is empty.
   *
   * @defaultValue `'No metrics'`
   */
  emptyText?: string;

  /**
   * Formats trailing text for each row.
   *
   * Context includes percentage, clamped numeric value, and original typed
   * metric object.
   *
   * @defaultValue Percentage text inherited from `ProgressBar`
   */
  formatValue?: (context: MetricBarValueContext<TMetric>) => string;

  /** Optional overall heading label rendered above the rows. */
  label?: string;

  /**
   * Shared upper domain bound.
   *
   * @defaultValue `100`
   */
  max?: number;

  /** Ordered metrics. The input array and objects are never mutated. */
  metrics: readonly TMetric[];

  /**
   * Shared lower domain bound.
   *
   * @defaultValue `0`
   */
  min?: number;

  /** Optional overall heading value rendered next to `label`. */
  value?: number | string;
}

/**
 * Renders aligned labeled progress rows.
 *
 * This pure renderer composes {@link renderProgressBar}; it does not import
 * Blessed. Import from `blessed-components/metric-bars` to keep the Blessed
 * adapter outside the module graph.
 *
 * Output with a heading:
 *
 * ```text
 * [label] [value]
 *
 * [padded metric label] [track] [formatted value]
 * ```
 *
 * @typeParam TMetric - Metric shape, including optional application metadata.
 * @param options - Shared range, track settings, metrics, and optional heading.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Propagates invalid width, range, character, or metric value errors from
 * {@link renderProgressBar}.
 *
 * @example
 *
 * ```ts
 * import { renderMetricBars } from 'blessed-components/metric-bars';
 *
 * renderMetricBars({
 *   barWidth: 16,
 *   label: 'Overall',
 *   value: '85%',
 *   metrics: [
 *     { label: 'Quality', value: 78 },
 *     { label: 'Popularity', value: 99 },
 *   ],
 * });
 * ```
 *
 * @example Typed metadata
 *
 * ```ts
 * renderMetricBars({
 *   barWidth: 10,
 *   metrics: [{ label: 'Latency', value: 25, unit: 'ms' }],
 *   formatValue: ({ metric, value }) => `${value}${metric.unit}`,
 * });
 * ```
 */
export function renderMetricBars<TMetric extends MetricBarItem>({
  barWidth,
  characters,
  emptyText = 'No metrics',
  formatValue,
  label,
  max = 100,
  metrics,
  min = 0,
  value,
}: RenderMetricBarsOptions<TMetric>): string {
  if (metrics.length === 0) {
    return emptyText;
  }

  const labelWidth = Math.max(...metrics.map(({ label }) => label.length));
  const rows = metrics
    .map((metric) =>
      renderProgressBar({
        ...(characters === undefined ? {} : { characters }),
        ...(formatValue === undefined
          ? {}
          : {
              formatValue: (context: ProgressBarValueContext) =>
                formatValue({ ...context, metric }),
            }),
        label: metric.label.padEnd(labelWidth),
        max,
        min,
        value: metric.value,
        width: barWidth,
      }),
    )
    .join('\n');
  const heading = [label, value].filter((part) => part !== undefined).join(' ');

  return heading.length === 0 ? rows : `${heading}\n\n${rows}`;
}
