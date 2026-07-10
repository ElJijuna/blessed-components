import { fitPlain } from '@/components/shared/text.js';

/** Options accepted by {@link renderRating}. */
export interface RenderRatingOptions {
  /** Empty score character. */
  empty?: string;

  /** Filled score character. */
  filled?: string;

  /** Maximum score. */
  max?: number;

  /** Numeric score. */
  value: number;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders a discrete score with text fallback. */
export function renderRating({
  empty = '-',
  filled = '*',
  max = 5,
  value,
  width,
}: RenderRatingOptions): string {
  if (!Number.isInteger(max) || max < 1 || !Number.isFinite(value)) {
    throw new RangeError('Rating max must be positive and value must be finite.');
  }

  const clamped = Math.min(max, Math.max(0, Math.round(value)));
  const text = `${filled.repeat(clamped)}${empty.repeat(max - clamped)} ${clamped}/${max}`;

  return fitPlain(text, width);
}
