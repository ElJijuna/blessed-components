import { stripBlessedTags } from '@/core/tags.js';
import { wrapText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Semantic tones supported by Alert. */
export type AlertTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';

/** Semantic marker characters used by {@link renderAlert}. */
export interface AlertMarkers {
  /** Marker for destructive, failed, or unavailable messages. */
  danger: string;

  /** Marker for informational messages. */
  info: string;

  /** Marker for default messages without positive or negative meaning. */
  neutral: string;

  /** Marker for successful messages. */
  success: string;

  /** Marker for warning or degraded messages. */
  warning: string;
}

/** Default Unicode Alert markers. */
export const ALERT_UNICODE_MARKERS: Readonly<AlertMarkers> = Object.freeze({
  danger: '×',
  info: 'i',
  neutral: '•',
  success: '✓',
  warning: '!',
});

/** Default ASCII Alert markers. */
export const ALERT_ASCII_MARKERS: Readonly<AlertMarkers> = Object.freeze({
  danger: 'x',
  info: 'i',
  neutral: '-',
  success: '+',
  warning: '!',
});

/** Options accepted by {@link renderAlert}. */
export interface RenderAlertOptions {
  /**
   * Optional detail text rendered under the title.
   *
   * Empty sanitized descriptions are omitted.
   */
  description?: string;

  /**
   * Explicit one-cell marker rendered before the title or description.
   */
  marker?: string;

  /**
   * Semantic marker mapping.
   *
   * Every marker must be exactly one terminal cell wide.
   *
   * @defaultValue `ALERT_UNICODE_MARKERS`
   */
  markers?: AlertMarkers;

  /**
   * Whether the semantic marker is rendered.
   *
   * @defaultValue `true`
   */
  showMarker?: boolean;

  /** Optional primary alert text. */
  title?: string;

  /**
   * Semantic status used to select a marker.
   *
   * @defaultValue `'info'`
   */
  tone?: AlertTone;

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

function assertOneCellMarkers(markers: AlertMarkers): void {
  if (Object.values(markers).some((value) => visibleWidth(value) !== 1)) {
    throw new RangeError('Alert markers must be one terminal cell wide.');
  }
}

function wrapLines(value: string, width: number | undefined): string[] {
  if (width === undefined) {
    return value.split('\n');
  }

  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('Alert width must be a positive integer.');
  }

  return value.split('\n').flatMap((line) => {
    if (line.length === 0) {
      return [''];
    }

    const words = line.split(/\s+/u);
    const lines: string[] = [];

    let current = '';

    for (const word of words) {
      if (word.length === 0) {
        continue;
      }

      if (visibleWidth(word) > width) {
        if (current.length > 0) {
          lines.push(current);
          current = '';
        }

        lines.push(...wrapText(word, width));
        continue;
      }

      const next = current.length === 0 ? word : `${current} ${word}`;

      if (visibleWidth(next) <= width) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    }

    if (current.length > 0) {
      lines.push(current);
    }

    return lines;
  });
}

/**
 * Renders a compact semantic alert message.
 *
 * Alert is display-only and does not rely on color to communicate tone. The
 * first line carries the semantic marker, while wrapped detail lines are
 * indented to align with the alert text.
 */
export function renderAlert({
  description,
  marker,
  markers = ALERT_UNICODE_MARKERS,
  showMarker = true,
  title,
  tone = 'info',
  width,
}: RenderAlertOptions): string {
  assertOneCellMarkers(markers);

  if (marker !== undefined && visibleWidth(marker) !== 1) {
    throw new RangeError('Alert markers must be one terminal cell wide.');
  }

  const safeTitle = title === undefined ? '' : sanitizeText(title);
  const safeDescription = description === undefined ? '' : sanitizeText(description);

  if (safeTitle.length === 0 && safeDescription.length === 0) {
    throw new RangeError('Alert title or description must be non-empty.');
  }

  if (width !== undefined && (!Number.isInteger(width) || width < 1)) {
    throw new RangeError('Alert width must be a positive integer.');
  }

  const selectedMarker = marker ?? markers[tone];
  const prefix = showMarker ? `${selectedMarker} ` : '';
  const continuationPrefix = showMarker ? '  ' : '';
  const textWidth = width === undefined ? undefined : Math.max(1, width - visibleWidth(prefix));
  const lines: string[] = [];

  if (safeTitle.length > 0) {
    for (const line of wrapLines(safeTitle, textWidth)) {
      lines.push(lines.length === 0 ? `${prefix}${line}` : `${continuationPrefix}${line}`);
    }
  }

  if (safeDescription.length > 0) {
    for (const line of wrapLines(safeDescription, textWidth)) {
      lines.push(lines.length === 0 ? `${prefix}${line}` : `${continuationPrefix}${line}`);
    }
  }

  return lines.join('\n');
}
