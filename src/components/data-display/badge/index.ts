const DEFAULT_BADGE_MARKERS: BadgeMarkers = {
  danger: '×',
  info: 'i',
  neutral: '•',
  success: '✓',
  warning: '!',
};

/**
 * Semantic marker characters used by {@link renderBadge}.
 *
 * Markers keep status understandable when color is unavailable or disabled.
 * Prefer one-cell characters for predictable width.
 */
export interface BadgeMarkers {
  /** Marker for destructive, failed, or unavailable states. */
  danger: string;

  /** Marker for informational or queued states. */
  info: string;

  /** Marker for default states without positive or negative meaning. */
  neutral: string;

  /** Marker for successful or healthy states. */
  success: string;

  /** Marker for warning, delayed, or degraded states. */
  warning: string;
}

/** Semantic tones supported by Badge. */
export type BadgeTone = keyof BadgeMarkers;

/** Delimiters used by the bracketed Badge variant. */
export interface BadgeDelimiters {
  /** Closing delimiter rendered after badge content. */
  close: string;

  /** Opening delimiter rendered before badge content. */
  open: string;
}

/** Visual structures supported by {@link renderBadge}. */
export type BadgeVariant = 'bracketed' | 'plain';

/**
 * Options accepted by {@link renderBadge}.
 */
export interface RenderBadgeOptions {
  /**
   * Delimiters used by the `bracketed` variant.
   *
   * Both values must be non-empty.
   *
   * @defaultValue `{ open: '[', close: ']' }`
   */
  delimiters?: BadgeDelimiters;

  /**
   * Semantic marker mapping.
   *
   * Every marker must be non-empty.
   *
   * @defaultValue Unicode status markers
   */
  markers?: BadgeMarkers;

  /**
   * Whether the semantic marker is rendered.
   *
   * Disabling the marker removes the non-color status cue. Do this only when
   * surrounding text already communicates the state.
   *
   * @defaultValue `true`
   */
  showMarker?: boolean;

  /** Non-empty text displayed by the Badge. */
  text: string;

  /**
   * Semantic status used to select a marker.
   *
   * @defaultValue `'neutral'`
   */
  tone?: BadgeTone;

  /**
   * Whether delimiters surround badge content.
   *
   * @defaultValue `'bracketed'`
   */
  variant?: BadgeVariant;
}

/**
 * Renders compact semantic status text.
 *
 * This function is framework-independent. Import from
 * `blessed-components/badge` to keep Blessed outside the module graph.
 *
 * Bracketed output:
 *
 * ```text
 * [marker text]
 * ```
 *
 * Plain output:
 *
 * ```text
 * marker text
 * ```
 *
 * @param options - Text, semantic tone, markers, delimiters, and variant.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown when text, any marker, or either delimiter is empty.
 *
 * @example Semantic success
 *
 * ```ts
 * import { renderBadge } from 'blessed-components/badge';
 *
 * renderBadge({
 *   text: 'Passed',
 *   tone: 'success',
 * });
 * // "[✓ Passed]"
 * ```
 *
 * @example ASCII output
 *
 * ```ts
 * renderBadge({
 *   delimiters: { open: '<', close: '>' },
 *   markers: {
 *     neutral: '-',
 *     info: 'i',
 *     success: '+',
 *     warning: '!',
 *     danger: 'x',
 *   },
 *   text: 'Passed',
 *   tone: 'success',
 * });
 * // "<+ Passed>"
 * ```
 */
export function renderBadge({
  delimiters = { close: ']', open: '[' },
  markers = DEFAULT_BADGE_MARKERS,
  showMarker = true,
  text,
  tone = 'neutral',
  variant = 'bracketed',
}: RenderBadgeOptions): string {
  if (text.length === 0) {
    throw new RangeError('Badge text must be non-empty.');
  }

  if (Object.values(markers).some((marker) => marker.length === 0)) {
    throw new RangeError('Badge markers must be non-empty.');
  }

  if (delimiters.open.length === 0 || delimiters.close.length === 0) {
    throw new RangeError('Badge delimiters must be non-empty.');
  }

  const content = showMarker ? `${markers[tone]} ${text}` : text;

  return variant === 'plain' ? content : `${delimiters.open}${content}${delimiters.close}`;
}
