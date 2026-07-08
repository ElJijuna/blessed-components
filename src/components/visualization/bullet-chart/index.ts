import { clamp, normalizeValue } from '@/core/scale.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Qualitative background range for BulletChart. */
export interface BulletChartRange {
  /** Inclusive range end. */
  end: number;

  /** Inclusive range start. */
  start: number;
}

/** Character tokens used by {@link renderBulletChart}. */
export interface BulletChartCharacters {
  actual: string;
  empty: string;
  range: string;
  target: string;
}

/** Options accepted by {@link renderBulletChart}. */
export interface RenderBulletChartOptions {
  characters?: BulletChartCharacters;
  formatValue?: (value: number) => string;
  label?: string;
  max?: number;
  min?: number;
  ranges?: readonly BulletChartRange[];
  target?: number;
  value: number;
  width: number;
}

const DEFAULT_CHARACTERS: BulletChartCharacters = {
  actual: '█',
  empty: ' ',
  range: '░',
  target: '|',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function position(value: number, min: number, max: number, width: number): number {
  return Math.min(
    width - 1,
    Math.max(0, Math.round(normalizeValue(value, { max, min }) * (width - 1))),
  );
}

/** Renders actual value against target and qualitative ranges. */
export function renderBulletChart({
  characters = DEFAULT_CHARACTERS,
  formatValue = (value) => String(value),
  label,
  max = 100,
  min = 0,
  ranges = [],
  target,
  value,
  width,
}: RenderBulletChartOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('BulletChart width must be a positive integer.');
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError('BulletChart max must be greater than min.');
  }

  if (!Number.isFinite(value)) {
    throw new RangeError('BulletChart value must be finite.');
  }

  const track = Array.from({ length: width }, () => characters.empty);

  for (const range of ranges) {
    if (!Number.isFinite(range.start) || !Number.isFinite(range.end) || range.end < range.start) {
      throw new RangeError('BulletChart ranges must be finite and ordered.');
    }

    const start = position(clamp(range.start, min, max), min, max, width);
    const end = position(clamp(range.end, min, max), min, max, width);

    for (let index = start; index <= end; index += 1) {
      track[index] = characters.range;
    }
  }

  const actualEnd = position(clamp(value, min, max), min, max, width);

  for (let index = 0; index <= actualEnd; index += 1) {
    track[index] = characters.actual;
  }

  if (target !== undefined) {
    if (!Number.isFinite(target)) {
      throw new RangeError('BulletChart target must be finite.');
    }

    track[position(clamp(target, min, max), min, max, width)] = characters.target;
  }

  const prefix = label === undefined ? '' : `${plainText(label)} `;

  return truncateText(
    `${prefix}[${track.join('')}] ${plainText(formatValue(clamp(value, min, max)))}`,
    width + prefix.length + 32,
  );
}
