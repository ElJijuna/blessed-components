import { describe, expect, it } from 'vitest';

import { clamp, normalizeValue, sampleSeries, scaleValue } from '@/core/index.js';

describe('core scale utilities', () => {
  it('clamps and normalizes numeric domains', () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(normalizeValue(15, { min: 10, max: 20 })).toBe(0.5);
  });

  it('scales a value into an inclusive output range', () => {
    expect(scaleValue(50, { domain: { min: 0, max: 100 }, range: { min: 0, max: 7 } })).toBe(3.5);
  });

  it('samples ordered series with max, min, first, or last buckets', () => {
    const values = [1, 9, 2, 3];

    expect(sampleSeries(values, 2)).toEqual([9, 3]);
    expect(sampleSeries(values, 2, { strategy: 'min' })).toEqual([1, 2]);
    expect(sampleSeries(values, 2, { strategy: 'first' })).toEqual([1, 2]);
    expect(sampleSeries(values, 2, { strategy: 'last' })).toEqual([9, 3]);
  });

  it('rejects invalid domains and widths', () => {
    expect(() => normalizeValue(1, { min: 1, max: 1 })).toThrow(RangeError);
    expect(() => sampleSeries([1], 0)).toThrow(RangeError);
  });
});
