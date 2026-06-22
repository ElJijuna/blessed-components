/** Main-axis flow direction used by Stack. */
export type StackDirection = 'horizontal' | 'vertical';

/** Cross-axis alignment used by Stack. */
export type StackAlign = 'center' | 'end' | 'start' | 'stretch';

/** Intrinsic terminal size of one Stack item. */
export interface StackItemSize {
  /** Item height in terminal rows. */
  height: number;

  /** Optional item width in terminal cells. */
  width?: number;
}

/** Positioned rectangle returned for one Stack item. */
export interface StackItemLayout {
  /** Allocated height in terminal rows. */
  height: number;

  /** Allocated width in terminal cells. */
  width: number;

  /** Horizontal position in terminal cells. */
  x: number;

  /** Vertical position in terminal rows. */
  y: number;
}

/** Options accepted by {@link calculateStackLayout}. */
export interface CalculateStackLayoutOptions {
  /** Cross-axis item alignment. @defaultValue `'stretch'` */
  align?: StackAlign;

  /** Main-axis flow direction. @defaultValue `'vertical'` */
  direction?: StackDirection;

  /** Empty cells or rows inserted between adjacent items. @defaultValue `0` */
  gap?: number;

  /** Available container height in terminal rows. */
  height: number;

  /** Intrinsic sizes in visual order. */
  items: readonly StackItemSize[];

  /** Available container width in terminal cells. */
  width: number;
}

function validateDimension(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function alignOffset(available: number, size: number, align: StackAlign): number {
  const remaining = Math.max(0, available - size);

  if (align === 'center') {
    return Math.floor(remaining / 2);
  }

  return align === 'end' ? remaining : 0;
}

/**
 * Calculates deterministic positions for direct Stack children.
 *
 * Items retain their main-axis size. Cross-axis `stretch` fills available
 * space; other alignments preserve each item's optional cross-axis size.
 */
export function calculateStackLayout({
  align = 'stretch',
  direction = 'vertical',
  gap = 0,
  height,
  items,
  width,
}: CalculateStackLayoutOptions): StackItemLayout[] {
  validateDimension(width, 'Stack width');
  validateDimension(height, 'Stack height');
  validateDimension(gap, 'Stack gap');

  for (const item of items) {
    validateDimension(item.height, 'Stack item height');

    if (item.width !== undefined) {
      validateDimension(item.width, 'Stack item width');
    }
  }

  let cursor = 0;

  return items.map(({ height: itemHeight, width: configuredWidth = 0 }) => {
    if (direction === 'horizontal') {
      const allocatedHeight = align === 'stretch' ? height : Math.min(height, itemHeight);
      const layout = {
        height: allocatedHeight,
        width: configuredWidth,
        x: cursor,
        y: alignOffset(height, allocatedHeight, align),
      };

      cursor += configuredWidth + gap;

      return layout;
    }

    const allocatedWidth = align === 'stretch' ? width : Math.min(width, configuredWidth);
    const layout = {
      height: itemHeight,
      width: allocatedWidth,
      x: alignOffset(width, allocatedWidth, align),
      y: cursor,
    };

    cursor += itemHeight + gap;

    return layout;
  });
}
