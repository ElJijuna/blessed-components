import { stripBlessedTags } from '@/core/tags.js';
import { wrapText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';
import {
  ALERT_ASCII_MARKERS,
  ALERT_UNICODE_MARKERS,
  type AlertMarkers,
  type AlertTone,
} from '../alert/index.js';

/** Border characters used by {@link renderCallout}. */
export interface CalloutBorderCharacters {
  /** Bottom-left corner. */
  bottomLeft: string;

  /** Bottom-right corner. */
  bottomRight: string;

  /** Horizontal rule. */
  horizontal: string;

  /** Top-left corner. */
  topLeft: string;

  /** Top-right corner. */
  topRight: string;

  /** Vertical rule. */
  vertical: string;
}

/** Default Unicode Callout border characters. */
export const CALLOUT_UNICODE_BORDER: Readonly<CalloutBorderCharacters> = Object.freeze({
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontal: '─',
  topLeft: '╭',
  topRight: '╮',
  vertical: '│',
});

/** Default ASCII Callout border characters. */
export const CALLOUT_ASCII_BORDER: Readonly<CalloutBorderCharacters> = Object.freeze({
  bottomLeft: '+',
  bottomRight: '+',
  horizontal: '-',
  topLeft: '+',
  topRight: '+',
  vertical: '|',
});

/** Options accepted by {@link renderCallout}. */
export interface RenderCalloutOptions {
  /**
   * Border characters.
   *
   * Every border character must be exactly one terminal cell wide.
   *
   * @defaultValue `CALLOUT_UNICODE_BORDER`
   */
  border?: CalloutBorderCharacters;

  /** Explanatory body text. */
  content?: string;

  /** Explicit one-cell marker rendered before the first title/content line. */
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
   * Horizontal padding inside the frame.
   *
   * @defaultValue `1`
   */
  padding?: number;

  /**
   * Whether the semantic marker is rendered.
   *
   * @defaultValue `true`
   */
  showMarker?: boolean;

  /** Optional primary callout text. */
  title?: string;

  /**
   * Semantic status used to select a marker.
   *
   * @defaultValue `'info'`
   */
  tone?: AlertTone;

  /** Total rendered width measured in terminal cells. */
  width?: number;
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

function assertOneCell(value: string, message: string): void {
  if (visibleWidth(value) !== 1) {
    throw new RangeError(message);
  }
}

function assertBorder(border: CalloutBorderCharacters): void {
  for (const value of Object.values(border)) {
    assertOneCell(value, 'Callout border characters must be one terminal cell wide.');
  }
}

function assertMarkers(markers: AlertMarkers): void {
  for (const value of Object.values(markers)) {
    assertOneCell(value, 'Callout markers must be one terminal cell wide.');
  }
}

function wrapLines(value: string, width: number): string[] {
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

function fitLine(value: string, width: number): string {
  return `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;
}

/**
 * Renders framed explanatory content.
 *
 * Callout is display-only and uses a visible marker plus border so tone remains
 * understandable without color.
 *
 * @param options - Title, content, tone, marker, border, padding, and width.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown for empty content, invalid width or padding, or non-one-cell border
 * characters and markers.
 */
export function renderCallout({
  border = CALLOUT_UNICODE_BORDER,
  content,
  marker,
  markers = ALERT_UNICODE_MARKERS,
  padding = 1,
  showMarker = true,
  title,
  tone = 'info',
  width,
}: RenderCalloutOptions): string {
  assertBorder(border);
  assertMarkers(markers);

  if (marker !== undefined) {
    assertOneCell(marker, 'Callout markers must be one terminal cell wide.');
  }

  if (!Number.isInteger(padding) || padding < 0) {
    throw new RangeError('Callout padding must be a non-negative integer.');
  }

  if (width !== undefined && (!Number.isInteger(width) || width < 4 + padding * 2)) {
    throw new RangeError('Callout width must fit borders and padding.');
  }

  const safeTitle = title === undefined ? '' : sanitizeText(title);
  const safeContent = content === undefined ? '' : sanitizeText(content);

  if (safeTitle.length === 0 && safeContent.length === 0) {
    throw new RangeError('Callout title or content must be non-empty.');
  }

  const selectedMarker = marker ?? markers[tone];
  const prefix = showMarker ? `${selectedMarker} ` : '';
  const rawLines = [
    ...(safeTitle.length === 0 ? [] : [`${prefix}${safeTitle}`]),
    ...(safeContent.length === 0
      ? []
      : safeContent
          .split('\n')
          .map((line, index) =>
            index === 0 && safeTitle.length === 0 ? `${prefix}${line}` : line,
          )),
  ];
  const minimumContentWidth = Math.max(1, ...rawLines.map((line) => visibleWidth(line)));
  const contentWidth = width === undefined ? minimumContentWidth : width - 2 - padding * 2;
  const innerWidth = contentWidth + padding * 2;
  const horizontal = border.horizontal.repeat(innerWidth);
  const inset = ' '.repeat(padding);
  const renderedLines = rawLines.flatMap((line) => wrapLines(line, contentWidth));

  return [
    `${border.topLeft}${horizontal}${border.topRight}`,
    ...renderedLines.map(
      (line) =>
        `${border.vertical}${inset}${fitLine(line, contentWidth)}${inset}${border.vertical}`,
    ),
    `${border.bottomLeft}${horizontal}${border.bottomRight}`,
  ].join('\n');
}

export {
  ALERT_ASCII_MARKERS as CALLOUT_ASCII_MARKERS,
  ALERT_UNICODE_MARKERS as CALLOUT_UNICODE_MARKERS,
};
