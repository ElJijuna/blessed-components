/** Axis alignment used by Center. */
export type CenterAlign = 'center' | 'end' | 'start' | 'stretch';

/** Intrinsic child size accepted by {@link calculateCenterLayout}. */
export interface CenterChildSize {
  /** Child height in terminal rows. */
  height: number;

  /** Child width in terminal cells. */
  width: number;
}

/** Positioned rectangle returned by {@link calculateCenterLayout}. */
export interface CenterLayout {
  /** Allocated height in terminal rows. */
  height: number;

  /** Allocated width in terminal cells. */
  width: number;

  /** Horizontal position in terminal cells. */
  x: number;

  /** Vertical position in terminal rows. */
  y: number;
}

/** Options accepted by {@link calculateCenterLayout}. */
export interface CalculateCenterLayoutOptions {
  /** Available container height in terminal rows. */
  height: number;

  /** Horizontal alignment. @defaultValue `'center'` */
  horizontal?: CenterAlign;

  /** Intrinsic child size. */
  item: CenterChildSize;

  /** Vertical alignment. @defaultValue `'center'` */
  vertical?: CenterAlign;

  /** Available container width in terminal cells. */
  width: number;
}

function validateDimension(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function alignedOffset(available: number, size: number, align: CenterAlign): number {
  const remaining = Math.max(0, available - size);

  if (align === 'center') {
    return Math.floor(remaining / 2);
  }

  return align === 'end' ? remaining : 0;
}

function alignedSize(available: number, size: number, align: CenterAlign): number {
  return align === 'stretch' ? available : Math.min(available, size);
}

/**
 * Calculates the rectangle for one child centered within a container.
 *
 * Center can independently align or stretch each axis. Oversized children are
 * clamped to the available terminal-cell dimensions.
 */
export function calculateCenterLayout({
  height,
  horizontal = 'center',
  item,
  vertical = 'center',
  width,
}: CalculateCenterLayoutOptions): CenterLayout {
  validateDimension(width, 'Center width');
  validateDimension(height, 'Center height');
  validateDimension(item.width, 'Center item width');
  validateDimension(item.height, 'Center item height');

  const childWidth = alignedSize(width, item.width, horizontal);
  const childHeight = alignedSize(height, item.height, vertical);

  return {
    height: childHeight,
    width: childWidth,
    x: alignedOffset(width, childWidth, horizontal),
    y: alignedOffset(height, childHeight, vertical),
  };
}
