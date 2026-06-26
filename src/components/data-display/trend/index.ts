import { type RenderTextOptions, renderText } from '../text/index.js';

/** Semantic direction supported by {@link renderTrend}. */
export type TrendDirection = 'down' | 'flat' | 'up';

/** Rendering mode used for the direction indicator. */
export type TrendMode = 'symbol' | 'symbol-text' | 'text';

/** Characters used to display trend direction. */
export interface TrendCharacters {
  /** Character used for a decreasing trend. */
  down: string;

  /** Character used when the trend is unchanged. */
  flat: string;

  /** Character used for an increasing trend. */
  up: string;
}

/** Text labels used when trend direction text is rendered. */
export interface TrendDirectionLabels {
  /** Text used for a decreasing trend. */
  down: string;

  /** Text used when the trend is unchanged. */
  flat: string;

  /** Text used for an increasing trend. */
  up: string;
}

/** Options accepted by {@link renderTrend}. */
export interface RenderTrendOptions
  extends Omit<RenderTextOptions, 'content' | 'height' | 'overflow' | 'verticalAlign'> {
  /**
   * Glyphs used for up, down, and flat trends.
   *
   * Every glyph must be non-empty.
   *
   * @defaultValue `{ up: '↑', down: '↓', flat: '→' }`
   */
  characters?: TrendCharacters;

  /** Semantic direction used to select a character and fallback text. */
  direction: TrendDirection;

  /** Optional context rendered after the trend value. */
  label?: string;

  /**
   * Text labels used by `text` and `symbol-text` modes.
   *
   * @defaultValue `{ up: 'up', down: 'down', flat: 'flat' }`
   */
  labels?: TrendDirectionLabels;

  /**
   * Direction rendering strategy.
   *
   * @defaultValue `'symbol'`
   */
  mode?: TrendMode;

  /**
   * Single-line overflow policy.
   *
   * @defaultValue `'truncate'`
   */
  overflow?: 'clip' | 'truncate';

  /** Magnitude or text describing the change. Numeric values must be finite. */
  value?: number | string;
}

const DEFAULT_TREND_CHARACTERS: TrendCharacters = {
  down: '↓',
  flat: '→',
  up: '↑',
};
const DEFAULT_TREND_LABELS: TrendDirectionLabels = {
  down: 'down',
  flat: 'flat',
  up: 'up',
};

function assertNonEmptyParts(parts: readonly string[], message: string): void {
  if (parts.some((part) => part.length === 0)) {
    throw new RangeError(message);
  }
}

/**
 * Renders a safe one-line directional trend indicator.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/trend` to keep Blessed outside the module graph.
 *
 * @param options - Direction, value, label, symbols, fallback text, and layout.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown when numeric values are not finite, characters or text labels are
 * empty, or configured text dimensions are invalid.
 */
export function renderTrend({
  characters = DEFAULT_TREND_CHARACTERS,
  direction,
  label,
  labels = DEFAULT_TREND_LABELS,
  mode = 'symbol',
  overflow = 'truncate',
  value,
  ...textOptions
}: RenderTrendOptions): string {
  assertNonEmptyParts(Object.values(characters), 'Trend characters must be non-empty.');
  assertNonEmptyParts(Object.values(labels), 'Trend direction labels must be non-empty.');

  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new RangeError('Trend value must be finite.');
  }

  const directionText =
    mode === 'symbol'
      ? characters[direction]
      : mode === 'text'
        ? labels[direction]
        : `${characters[direction]} ${labels[direction]}`;
  const content = [directionText, value, label].filter((part) => part !== undefined).join(' ');

  return renderText({
    ...textOptions,
    content,
    height: 1,
    overflow,
  });
}
