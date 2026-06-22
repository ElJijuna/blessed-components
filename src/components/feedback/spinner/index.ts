import { stripBlessedTags } from '../../../core/tags.js';
import { stripAnsi, visibleWidth } from '../../../core/width.js';

/** Default Unicode Spinner frames. */
export const SPINNER_UNICODE_FRAMES = Object.freeze([
  '⠋',
  '⠙',
  '⠹',
  '⠸',
  '⠼',
  '⠴',
  '⠦',
  '⠧',
  '⠇',
  '⠏',
]);

/** Default ASCII Spinner frames. */
export const SPINNER_ASCII_FRAMES = Object.freeze(['|', '/', '-', '\\']);

/** Options accepted by {@link renderSpinner}. */
export interface RenderSpinnerOptions {
  /** Zero-based animation frame. Values wrap by frame count. */
  frame: number;

  /** Ordered one-cell animation frames. @defaultValue `SPINNER_UNICODE_FRAMES` */
  frames?: readonly string[];

  /** Optional literal text rendered after the frame. */
  label?: string;
}

/**
 * Renders one deterministic Spinner frame.
 *
 * Animation timing belongs to adapters. This renderer only maps frame index
 * to safe terminal text.
 */
export function renderSpinner({
  frame,
  frames = SPINNER_UNICODE_FRAMES,
  label,
}: RenderSpinnerOptions): string {
  if (!Number.isInteger(frame) || frame < 0) {
    throw new RangeError('Spinner frame must be a non-negative integer.');
  }

  if (frames.length === 0 || frames.some((value) => visibleWidth(value) !== 1)) {
    throw new RangeError('Spinner frames must contain one-cell characters.');
  }

  const selected = frames[frame % frames.length];

  if (selected === undefined) {
    throw new RangeError('Spinner frames must be non-empty.');
  }

  if (label === undefined) {
    return selected;
  }

  const safeLabel = stripBlessedTags(stripAnsi(label));

  return safeLabel.length === 0 ? selected : `${selected} ${safeLabel}`;
}
