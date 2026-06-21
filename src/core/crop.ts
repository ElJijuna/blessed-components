import { sliceByWidth } from './width.js';

export interface CropTextOptions {
  height: number;
  left?: number;
  top?: number;
  width: number;
}

/**
 * Crops multiline text to a rectangular terminal-cell viewport.
 */
export function cropText(
  value: string,
  { height, left = 0, top = 0, width }: CropTextOptions,
): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(left) ||
    left < 0 ||
    !Number.isInteger(top) ||
    top < 0
  ) {
    throw new RangeError('Crop dimensions and offsets must be non-negative integers.');
  }

  return value
    .split('\n')
    .slice(top, top + height)
    .map((line) => sliceByWidth(line, width, left))
    .join('\n');
}
