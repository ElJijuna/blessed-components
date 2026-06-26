import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Semantic tones supported by Status. */
export type StatusTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';

/** Semantic marker characters used by {@link renderStatus}. */
export interface StatusMarkers {
  /** Marker for destructive, failed, or unavailable states. */
  danger: string;

  /** Marker for informational, pending, or queued states. */
  info: string;

  /** Marker for default states without positive or negative meaning. */
  neutral: string;

  /** Marker for successful or healthy states. */
  success: string;

  /** Marker for warning, delayed, or degraded states. */
  warning: string;
}

/** Default Unicode Status markers. */
export const STATUS_UNICODE_MARKERS: Readonly<StatusMarkers> = Object.freeze({
  danger: '×',
  info: 'i',
  neutral: '•',
  success: '✓',
  warning: '!',
});

/** Default ASCII Status markers. */
export const STATUS_ASCII_MARKERS: Readonly<StatusMarkers> = Object.freeze({
  danger: 'x',
  info: 'i',
  neutral: '-',
  success: '+',
  warning: '!',
});

/** Options accepted by {@link renderStatus}. */
export interface RenderStatusOptions {
  /**
   * Optional secondary text rendered after the label.
   *
   * Empty sanitized details are omitted.
   */
  detail?: string;

  /**
   * Separator inserted between label and detail.
   *
   * @defaultValue `' - '`
   */
  detailSeparator?: string;

  /** Non-empty primary status text. */
  label: string;

  /** Explicit marker rendered before the label. */
  marker?: string;

  /**
   * Semantic marker mapping.
   *
   * Every marker must be exactly one terminal cell wide.
   *
   * @defaultValue `STATUS_UNICODE_MARKERS`
   */
  markers?: StatusMarkers;

  /**
   * Whether the semantic marker is rendered.
   *
   * @defaultValue `true`
   */
  showMarker?: boolean;

  /**
   * Semantic status used to select a marker.
   *
   * @defaultValue `'neutral'`
   */
  tone?: StatusTone;
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

function assertOneCellMarker(value: string): void {
  if (visibleWidth(value) !== 1) {
    throw new RangeError('Status markers must be one terminal cell wide.');
  }
}

/**
 * Renders one inline semantic status.
 *
 * Status is intended for compact state summaries such as health, job, or
 * connection state. Dynamic label and detail text are sanitized so callers
 * cannot inject ANSI sequences or Blessed tags.
 */
export function renderStatus({
  detail,
  detailSeparator = ' - ',
  label,
  marker,
  markers = STATUS_UNICODE_MARKERS,
  showMarker = true,
  tone = 'neutral',
}: RenderStatusOptions): string {
  const safeLabel = sanitizeText(label);

  if (safeLabel.length === 0) {
    throw new RangeError('Status label must be non-empty.');
  }

  if (Object.values(markers).some((value) => visibleWidth(value) !== 1)) {
    throw new RangeError('Status markers must be one terminal cell wide.');
  }

  if (marker !== undefined) {
    assertOneCellMarker(marker);
  }

  const safeDetail = detail === undefined ? undefined : sanitizeText(detail);
  const content =
    safeDetail === undefined || safeDetail.length === 0
      ? safeLabel
      : `${safeLabel}${detailSeparator}${safeDetail}`;

  return showMarker ? `${marker ?? markers[tone]} ${content}` : content;
}
