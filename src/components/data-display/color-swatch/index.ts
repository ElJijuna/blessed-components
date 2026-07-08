import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

export interface RenderColorSwatchOptions {
  color: string;
  label?: string;
  marker?: string;
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).trim();
}

/** Renders a color token and value without relying on terminal color. */
export function renderColorSwatch({
  color,
  label,
  marker = '■',
  width,
}: RenderColorSwatchOptions): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('ColorSwatch width must be a non-negative integer.');
  }

  if (width === 0) {
    return '';
  }

  const safeColor = plainText(color);
  const safeLabel = label === undefined ? safeColor : plainText(label);

  if (safeColor.length === 0 || safeLabel.length === 0 || plainText(marker).length === 0) {
    throw new RangeError('ColorSwatch label, color, and marker must be non-empty.');
  }

  return truncateText(`${plainText(marker)} ${safeLabel} ${safeColor}`, width);
}
