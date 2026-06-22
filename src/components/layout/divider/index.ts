import { sliceByWidth, visibleWidth } from '../../../core/width.js';

/** Direction in which a Divider extends. */
export type DividerOrientation = 'horizontal' | 'vertical';

/** Label placement along a horizontal Divider. */
export type DividerLabelAlign = 'center' | 'end' | 'start';

/** Characters used to draw horizontal and vertical Dividers. */
export interface DividerCharacters {
  /** Character repeated by horizontal Dividers. */
  horizontal: string;

  /** Character repeated by vertical Dividers. */
  vertical: string;
}

/** Options accepted by {@link renderDivider}. */
export interface RenderDividerOptions {
  /**
   * Drawing characters.
   *
   * @defaultValue `{ horizontal: '─', vertical: '│' }`
   */
  characters?: DividerCharacters;

  /** Optional label embedded in a horizontal Divider. */
  label?: string;

  /** Horizontal label placement. @defaultValue `'center'` */
  labelAlign?: DividerLabelAlign;

  /** Total terminal cells or rows occupied by the Divider. */
  length: number;

  /** Divider direction. @defaultValue `'horizontal'` */
  orientation?: DividerOrientation;
}

/**
 * Renders a fixed-size terminal separator.
 *
 * Horizontal output occupies `length` terminal cells. Vertical output contains
 * `length` rows separated by newlines.
 */
export function renderDivider({
  characters = { horizontal: '─', vertical: '│' },
  label,
  labelAlign = 'center',
  length,
  orientation = 'horizontal',
}: RenderDividerOptions): string {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError('Divider length must be a positive integer.');
  }

  if (visibleWidth(characters.horizontal) !== 1 || visibleWidth(characters.vertical) !== 1) {
    throw new RangeError('Divider characters must occupy one terminal cell.');
  }

  if (orientation === 'vertical' && label !== undefined) {
    throw new RangeError('Divider labels require horizontal orientation.');
  }

  if (orientation === 'vertical') {
    return Array.from({ length }, () => characters.vertical).join('\n');
  }

  if (label === undefined) {
    return characters.horizontal.repeat(length);
  }

  const centered = labelAlign === 'center';
  const separatorWidth = centered ? 2 : 1;
  const safeLabel = sliceByWidth(label, Math.max(0, length - separatorWidth));
  const labelWidth = visibleWidth(safeLabel);

  if (labelWidth === 0) {
    return characters.horizontal.repeat(length);
  }

  const remaining = Math.max(0, length - labelWidth - separatorWidth);
  const before =
    labelAlign === 'end' ? remaining : labelAlign === 'center' ? Math.floor(remaining / 2) : 0;
  const after = remaining - before;

  if (labelAlign === 'start') {
    return `${safeLabel} ${characters.horizontal.repeat(after)}`;
  }

  if (labelAlign === 'end') {
    return `${characters.horizontal.repeat(before)} ${safeLabel}`;
  }

  return `${characters.horizontal.repeat(before)} ${safeLabel} ${characters.horizontal.repeat(after)}`;
}
