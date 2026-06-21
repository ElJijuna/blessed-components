const DEFAULT_TREND_CHARACTERS: StatTrendCharacters = {
  down: '↓',
  flat: '→',
  up: '↑',
};

/**
 * Options accepted by {@link renderStat}.
 *
 * A Stat presents one primary metric. It can add a unit, directional trend,
 * and description without embedding ANSI sequences or Blessed tags.
 */
export interface RenderStatOptions {
  /** Optional supporting text rendered after the primary metric. */
  description?: string;

  /** Human-readable label explaining the metric. */
  label: string;

  /**
   * Arrangement of label and value.
   *
   * - `stacked` renders the label above the value.
   * - `inline` renders the label and value on one line.
   *
   * @defaultValue `'stacked'`
   */
  layout?: StatLayout;

  /** Optional directional change rendered beside the primary value. */
  trend?: StatTrend;

  /**
   * Glyphs used for up, down, and flat trends.
   *
   * Every glyph must be non-empty. Prefer single-cell characters.
   *
   * @defaultValue `{ up: '↑', down: '↓', flat: '→' }`
   */
  trendCharacters?: StatTrendCharacters;

  /**
   * Optional unit appended to the primary value.
   *
   * Use {@link RenderStatOptions.unitSeparator} when a space or custom
   * separator is required.
   */
  unit?: string;

  /**
   * Text inserted between the primary value and `unit`.
   *
   * The empty default supports attached units such as `%`. Use `' '` for
   * detached units such as `GB`.
   *
   * @defaultValue `''`
   */
  unitSeparator?: string;

  /**
   * Primary metric value.
   *
   * Numeric values must be finite.
   */
  value: number | string;
}

/**
 * Directional change displayed beside a Stat value.
 */
export interface StatTrend {
  /** Semantic direction used to select a trend character. */
  direction: StatTrendDirection;

  /** Optional context rendered after the trend value. */
  label?: string;

  /**
   * Magnitude or text describing the change.
   *
   * Numeric values must be finite.
   */
  value: number | string;
}

/**
 * Characters used to display trend direction.
 */
export interface StatTrendCharacters {
  /** Character used for a decreasing trend. */
  down: string;

  /** Character used when the trend is unchanged. */
  flat: string;

  /** Character used for an increasing trend. */
  up: string;
}

/** Semantic direction supported by {@link StatTrend}. */
export type StatTrendDirection = 'down' | 'flat' | 'up';

/** Available label/value arrangements for {@link renderStat}. */
export type StatLayout = 'inline' | 'stacked';

/**
 * Renders a deterministic text representation of one important metric.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/stat` to keep Blessed outside the module graph.
 *
 * Stacked output:
 *
 * ```text
 * [label]
 * [value][unit] [optional trend]
 * [optional description]
 * ```
 *
 * Inline output:
 *
 * ```text
 * [label] [value][unit] [optional trend]
 * [optional description]
 * ```
 *
 * @param options - Label, value, layout, unit, trend, and description.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown when a numeric primary or trend value is not finite.
 *
 * @throws `RangeError`
 * Thrown when any configured trend character is empty.
 *
 * @example Stacked metric
 *
 * ```ts
 * import { renderStat } from 'blessed-components/stat';
 *
 * renderStat({
 *   label: 'Revenue',
 *   value: '$84K',
 *   trend: {
 *     direction: 'up',
 *     value: '12.5%',
 *     label: 'vs last month',
 *   },
 * });
 * // "Revenue\n$84K ↑ 12.5% vs last month"
 * ```
 *
 * @example Compact percentage
 *
 * ```ts
 * renderStat({
 *   label: 'Overall',
 *   layout: 'inline',
 *   unit: '%',
 *   value: 85,
 * });
 * // "Overall 85%"
 * ```
 */
export function renderStat({
  description,
  label,
  layout = 'stacked',
  trend,
  trendCharacters = DEFAULT_TREND_CHARACTERS,
  unit,
  unitSeparator = '',
  value,
}: RenderStatOptions): string {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new RangeError('Stat value must be finite.');
  }

  if (Object.values(trendCharacters).some((character) => character.length === 0)) {
    throw new RangeError('Stat trend characters must be non-empty.');
  }

  if (typeof trend?.value === 'number' && !Number.isFinite(trend.value)) {
    throw new RangeError('Stat trend value must be finite.');
  }

  const primaryValue = unit === undefined ? String(value) : `${value}${unitSeparator}${unit}`;
  const trendText =
    trend === undefined
      ? undefined
      : [trendCharacters[trend.direction], trend.value, trend.label]
          .filter((part) => part !== undefined)
          .join(' ');
  const valueLine = trendText === undefined ? primaryValue : `${primaryValue} ${trendText}`;
  const primaryLine = layout === 'inline' ? `${label} ${valueLine}` : undefined;

  return layout === 'inline'
    ? [primaryLine, description].filter((line) => line !== undefined).join('\n')
    : [label, valueLine, description].filter((line) => line !== undefined).join('\n');
}
