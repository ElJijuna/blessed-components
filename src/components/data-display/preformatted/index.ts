import { stripBlessedTags } from '@/core/tags.js';
import { sliceByWidth, stripAnsi, visibleWidth } from '@/core/width.js';

/** Options accepted by {@link renderPreformatted}. */
export interface RenderPreformattedOptions {
  /** Multiline content. ANSI sequences and Blessed tags are removed. */
  content: string;

  /** Maximum rendered line count. */
  height?: number;

  /** Horizontal cell offset applied before width clipping. @defaultValue `0` */
  horizontalOffset?: number;

  /** Vertical line offset applied before height clipping. @defaultValue `0` */
  verticalOffset?: number;

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

/** Measurements for a sanitized preformatted block. */
export interface PreformattedMetrics {
  /** Total source lines after sanitizing content. */
  lineCount: number;

  /** Widest source line measured in terminal cells. */
  maxLineWidth: number;
}

function sanitizeContent(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertNonNegativeInteger(value: number | undefined, name: string): void {
  if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function splitLines(content: string): string[] {
  return sanitizeContent(content).split('\n');
}

/** Measures sanitized preformatted content without wrapping or truncation. */
export function measurePreformatted(content: string): PreformattedMetrics {
  const lines = splitLines(content);

  return {
    lineCount: lines.length,
    maxLineWidth: lines.reduce((maxWidth, line) => Math.max(maxWidth, visibleWidth(line)), 0),
  };
}

/**
 * Renders a block of safe text while preserving source whitespace and line
 * breaks. Width and height form a viewport; overflowing text is clipped with
 * explicit horizontal and vertical offsets.
 */
export function renderPreformatted({
  content,
  height,
  horizontalOffset = 0,
  verticalOffset = 0,
  width,
}: RenderPreformattedOptions): string {
  assertNonNegativeInteger(width, 'Preformatted width');
  assertNonNegativeInteger(height, 'Preformatted height');
  assertNonNegativeInteger(horizontalOffset, 'Preformatted horizontal offset');
  assertNonNegativeInteger(verticalOffset, 'Preformatted vertical offset');

  let lines = splitLines(content).slice(verticalOffset);

  if (height !== undefined) {
    lines = lines.slice(0, height);
  }

  if (width !== undefined) {
    lines = lines.map((line) => sliceByWidth(line, width, horizontalOffset));
  }

  return lines.join('\n');
}
