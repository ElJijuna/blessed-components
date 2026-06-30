/** Main axis consumed by Spacer. */
export type SpacerAxis = 'horizontal' | 'vertical';

/** Spacer size along its main axis. */
export type SpacerSize = 'fill' | number;

/** Cross-axis behavior used by Spacer. */
export type SpacerCrossAxis = 'collapse' | 'stretch';

/** Empty rectangle returned by {@link calculateSpacerLayout}. */
export interface SpacerLayout {
  /** Allocated height in terminal rows. */
  height: number;

  /** Allocated width in terminal cells. */
  width: number;
}

/** Options accepted by {@link calculateSpacerLayout}. */
export interface CalculateSpacerLayoutOptions {
  /** Main axis consumed by the spacer. @defaultValue `'vertical'` */
  axis?: SpacerAxis;

  /** Available container height in terminal rows. */
  height: number;

  /** Cross-axis behavior. @defaultValue `'stretch'` */
  crossAxis?: SpacerCrossAxis;

  /** Main-axis size. `fill` consumes the available main-axis space. @defaultValue `'fill'` */
  size?: SpacerSize;

  /** Available container width in terminal cells. */
  width: number;
}

function validateDimension(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function resolvedSize(available: number, size: SpacerSize): number {
  if (size === 'fill') {
    return available;
  }

  validateDimension(size, 'Spacer size');

  return Math.min(available, size);
}

/**
 * Calculates an empty spacer rectangle for layout composition.
 *
 * The main axis can be fixed or flexible. The cross axis stretches by default
 * so Spacer behaves like an invisible block in terminal containers.
 */
export function calculateSpacerLayout({
  axis = 'vertical',
  crossAxis = 'stretch',
  height,
  size = 'fill',
  width,
}: CalculateSpacerLayoutOptions): SpacerLayout {
  validateDimension(width, 'Spacer width');
  validateDimension(height, 'Spacer height');

  if (axis === 'horizontal') {
    return {
      height: crossAxis === 'stretch' ? height : 0,
      width: resolvedSize(width, size),
    };
  }

  return {
    height: resolvedSize(height, size),
    width: crossAxis === 'stretch' ? width : 0,
  };
}
