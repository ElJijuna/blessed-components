import { stripBlessedTags } from '@/core/tags.js';
import { truncateText, wrapText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Shared options for compact plain-text renderers. */
export interface PlainRenderOptions {
  /** Maximum number of rendered lines. */
  height?: number | undefined;

  /** Maximum terminal-cell width of each line. */
  width?: number | undefined;
}

/** Removes terminal markup from caller-controlled text. */
export function plain(value: string | number | boolean | null | undefined): string {
  return stripAnsi(stripBlessedTags(String(value ?? '')));
}

/** Ensures optional dimensions are non-negative integers. */
export function assertPlainDimensions({ height, width }: PlainRenderOptions, name: string): void {
  if (
    (width !== undefined && (!Number.isInteger(width) || width < 0)) ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError(`${name} dimensions must be non-negative integers.`);
  }
}

/** Truncates one sanitized line to width. */
export function fitPlain(value: string, width?: number): string {
  const normalized = plain(value);

  return width === undefined ? normalized : truncateText(normalized, width);
}

/** Pads a sanitized value to fixed terminal-cell width. */
export function pad(value: string, width: number): string {
  const normalized = truncateText(plain(value), width);

  return `${normalized}${' '.repeat(Math.max(0, width - visibleWidth(normalized)))}`;
}

/** Renders sanitized wrapped lines with optional height clipping. */
export function renderPlainLines(
  lines: readonly string[],
  options: PlainRenderOptions = {},
): string {
  assertPlainDimensions(options, 'Plain renderer');

  const rendered = lines.flatMap((line) => {
    const normalized = plain(line);

    return options.width === undefined ? [normalized] : wrapText(normalized, options.width);
  });

  return (options.height === undefined ? rendered : rendered.slice(0, options.height)).join('\n');
}
