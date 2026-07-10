import { fitPlain, renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderSkeleton}. */
export interface RenderSkeletonOptions {
  /** Placeholder character. */
  character?: string;

  /** Maximum rendered height. */
  height?: number;

  /** Optional label rendered above placeholder rows. */
  label?: string;

  /** Number of placeholder rows. */
  rows?: number;

  /** Placeholder row width. */
  width: number;
}

/** Renders loading placeholders for terminal layouts. */
export function renderSkeleton({
  character = '-',
  height,
  label,
  rows = 3,
  width,
}: RenderSkeletonOptions): string {
  if (!Number.isInteger(rows) || rows < 0 || !Number.isInteger(width) || width < 0) {
    throw new RangeError('Skeleton rows and width must be non-negative integers.');
  }

  const marker = fitPlain(character, 1) || '-';
  const lines = [
    ...(label === undefined ? [] : [label]),
    ...Array.from({ length: rows }, () => marker.repeat(width)),
  ];

  return renderPlainLines(lines, { height });
}
