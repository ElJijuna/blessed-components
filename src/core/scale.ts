export interface NumericRange {
  max: number;
  min: number;
}

export interface ScaleValueOptions {
  domain: NumericRange;
  range: NumericRange;
}

export interface SampleSeriesOptions {
  strategy?: 'first' | 'last' | 'max' | 'min';
}

function validateRange({ max, min }: NumericRange, name: string): void {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError(`${name} max must be greater than min.`);
  }
}

/**
 * Clamps a finite value to an inclusive numeric range.
 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    throw new RangeError('Clamp values must be finite and max must be at least min.');
  }

  return Math.min(max, Math.max(min, value));
}

/**
 * Normalizes a value into the range from 0 to 1.
 */
export function normalizeValue(value: number, domain: NumericRange): number {
  validateRange(domain, 'Domain');

  return (clamp(value, domain.min, domain.max) - domain.min) / (domain.max - domain.min);
}

/**
 * Maps a value from one numeric range into another.
 */
export function scaleValue(value: number, { domain, range }: ScaleValueOptions): number {
  validateRange(range, 'Range');

  return range.min + normalizeValue(value, domain) * (range.max - range.min);
}

/**
 * Reduces an ordered series into at most `width` bucket samples.
 */
export function sampleSeries(
  values: readonly number[],
  width: number,
  { strategy = 'max' }: SampleSeriesOptions = {},
): number[] {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('Sample width must be a positive integer.');
  }

  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError('Series values must be finite.');
  }

  if (values.length <= width) {
    return [...values];
  }

  return Array.from({ length: width }, (_, index) => {
    const start = Math.floor((index * values.length) / width);
    const end = Math.floor(((index + 1) * values.length) / width);
    const bucket = values.slice(start, end);
    const [first] = bucket;
    const last = bucket.at(-1);

    if (first === undefined || last === undefined) {
      throw new RangeError('Sample bucket cannot be empty.');
    }

    switch (strategy) {
      case 'first':
        return first;
      case 'last':
        return last;
      case 'min':
        return Math.min(...bucket);
      case 'max':
        return Math.max(...bucket);
    }

    throw new RangeError(`Unknown sample strategy: ${String(strategy)}`);
  });
}
