import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

export interface RenderAsciiArtOptions {
  align?: 'center' | 'left' | 'right';
  art: string;
  height: number;
  offset?: number;
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function alignLine(line: string, width: number, align: 'center' | 'left' | 'right'): string {
  const truncated = truncateText(line, width);
  const remaining = Math.max(0, width - visibleWidth(truncated));

  if (align === 'right') {
    return `${' '.repeat(remaining)}${truncated}`;
  }

  if (align === 'center') {
    return `${' '.repeat(Math.floor(remaining / 2))}${truncated}`;
  }

  return truncated;
}

/** Renders static ASCII art with bounded height, cropping, and alignment. */
export function renderAsciiArt({
  align = 'left',
  art,
  height,
  offset = 0,
  width,
}: RenderAsciiArtOptions): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('AsciiArt dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  return plainText(art)
    .split('\n')
    .slice(offset, offset + height)
    .map((line) => alignLine(line, width, align))
    .join('\n');
}
