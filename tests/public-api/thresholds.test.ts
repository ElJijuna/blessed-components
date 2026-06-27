import { describe, expect, it } from 'vitest';

import { renderThresholds, resolveThreshold } from '@/index.js';

describe('Thresholds', () => {
  const ranges = [
    { end: 69, label: 'normal', tone: 'success' },
    { end: 89, label: 'warning', start: 70, tone: 'warning' },
    { label: 'critical', start: 90, tone: 'critical' },
  ] as const;

  it('resolves the first range containing a value', () => {
    expect(resolveThreshold({ max: 100, min: 0, thresholds: ranges, value: 72 })).toEqual(
      ranges[1],
    );
  });

  it('renders ranges with markers and active state', () => {
    expect(renderThresholds({ max: 100, min: 0, thresholds: ranges, value: 72 })).toBe(
      '✓ normal 0..69  [! warning 70..89]  × critical 90..100',
    );
  });

  it('supports custom formatting, custom markers, and truncation', () => {
    expect(
      renderThresholds({
        formatRange: ({ end, start }) => `${start}-${end}ms`,
        max: 200,
        min: 0,
        thresholds: [{ end: 150, label: 'ok', marker: '+' }],
        value: 80,
        width: 16,
      }),
    ).toBe('[+ ok 0-150ms]');
  });

  it('strips terminal markup and renders empty state', () => {
    expect(
      renderThresholds({
        emptyText: '\u001B[31mNo {bold}ranges{/bold}\u001B[0m',
        max: 100,
        min: 0,
        thresholds: [],
      }),
    ).toBe('No ranges');
  });

  it('rejects invalid domains, values, labels, markers, and ranges', () => {
    expect(() => resolveThreshold({ max: 0, min: 0, thresholds: [], value: 0 })).toThrow(
      RangeError,
    );
    expect(() => resolveThreshold({ max: 100, min: 0, thresholds: [], value: Number.NaN })).toThrow(
      RangeError,
    );
    expect(() =>
      renderThresholds({ max: 100, min: 0, thresholds: [{ label: '', start: 0 }] }),
    ).toThrow(RangeError);
    expect(() =>
      renderThresholds({ max: 100, min: 0, thresholds: [{ label: 'bad', marker: '' }] }),
    ).toThrow(RangeError);
    expect(() =>
      renderThresholds({ max: 100, min: 0, thresholds: [{ end: 10, label: 'bad', start: 20 }] }),
    ).toThrow(RangeError);
  });
});
