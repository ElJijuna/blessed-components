export interface Rect {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface Insets {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
}

/**
 * Insets a rectangle while preventing negative dimensions.
 */
export function insetRect(rect: Rect, { bottom = 0, left = 0, right = 0, top = 0 }: Insets): Rect {
  return {
    height: Math.max(0, rect.height - top - bottom),
    width: Math.max(0, rect.width - left - right),
    x: rect.x + left,
    y: rect.y + top,
  };
}

/**
 * Distributes integer terminal cells proportionally across weights.
 */
export function distributeSpace(total: number, weights: readonly number[]): number[] {
  if (!Number.isInteger(total) || total < 0 || weights.some((weight) => weight < 0)) {
    throw new RangeError('Space and weights must be non-negative.');
  }

  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);

  if (weightTotal === 0) {
    return weights.map(() => 0);
  }

  const exact = weights.map((weight) => (total * weight) / weightTotal);
  const result = exact.map(Math.floor);

  let remaining = total - result.reduce((sum, value) => sum + value, 0);

  const order = exact
    .map((value, index) => ({ fraction: value - Math.floor(value), index }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index);

  for (const { index } of order) {
    if (remaining === 0) {
      break;
    }

    result[index] = (result[index] ?? 0) + 1;
    remaining -= 1;
  }

  return result;
}
