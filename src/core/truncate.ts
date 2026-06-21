import { sliceByWidth, visibleWidth } from './width.js';

export interface TruncateTextOptions {
  omission?: string;
  position?: 'end' | 'middle' | 'start';
}

/**
 * Truncates text to a terminal-cell width.
 */
export function truncateText(
  value: string,
  width: number,
  { omission = '…', position = 'end' }: TruncateTextOptions = {},
): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Truncate width must be a non-negative integer.');
  }

  if (visibleWidth(value) <= width) {
    return value;
  }

  const omissionWidth = visibleWidth(omission);

  if (omissionWidth > width) {
    return sliceByWidth(omission, width);
  }

  const available = width - omissionWidth;

  if (position === 'start') {
    return `${omission}${sliceByWidth(value, available, visibleWidth(value) - available)}`;
  }

  if (position === 'middle') {
    const leftWidth = Math.floor(available / 2);
    const rightWidth = available - leftWidth;

    return `${sliceByWidth(value, leftWidth)}${omission}${sliceByWidth(
      value,
      rightWidth,
      visibleWidth(value) - rightWidth,
    )}`;
  }

  return `${sliceByWidth(value, available)}${omission}`;
}

/**
 * Wraps text into terminal-cell-aware lines.
 */
export function wrapText(value: string, width: number): string[] {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('Wrap width must be a positive integer.');
  }

  const lines: string[] = [];

  for (const sourceLine of value.split('\n')) {
    if (sourceLine === '') {
      lines.push('');
      continue;
    }

    let offset = 0;

    const sourceWidth = visibleWidth(sourceLine);

    while (offset < sourceWidth) {
      const line = sliceByWidth(sourceLine, width, offset);

      if (line === '') {
        break;
      }

      lines.push(line);
      offset += visibleWidth(line);
    }
  }

  return lines;
}
