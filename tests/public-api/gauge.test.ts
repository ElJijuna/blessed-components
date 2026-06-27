import { describe, expect, it } from 'vitest';

import { renderGauge } from '@/index.js';

describe('Gauge', () => {
  it('renders a bounded value with label and threshold text', () => {
    expect(
      renderGauge({
        label: 'CPU',
        thresholds: [
          { end: 69, label: 'normal' },
          { end: 89, label: 'warning', start: 70 },
          { label: 'critical', start: 90 },
        ],
        value: 72,
        width: 10,
      }),
    ).toBe('CPU [███████░░░] 72% warning');
  });

  it('clamps values and supports custom formatting and characters', () => {
    expect(
      renderGauge({
        characters: { empty: '-', filled: '#', leftCap: '<', rightCap: '>' },
        formatValue: ({ value }) => `${value}ms`,
        max: 200,
        value: 250,
        width: 5,
      }),
    ).toBe('<#####> 200ms');
  });

  it('strips terminal markup from dynamic text', () => {
    expect(
      renderGauge({
        label: '{red-fg}CPU{/red-fg}',
        thresholds: [{ label: '\u001B[31mhot\u001B[0m', start: 80 }],
        value: 90,
        width: 4,
      }),
    ).toBe('CPU [████] 90% hot');
  });

  it('rejects invalid dimensions, ranges, values, and thresholds', () => {
    expect(() => renderGauge({ value: 50, width: 0 })).toThrow(RangeError);
    expect(() => renderGauge({ max: 10, min: 10, value: 50, width: 5 })).toThrow(RangeError);
    expect(() => renderGauge({ value: Number.NaN, width: 5 })).toThrow(RangeError);
    expect(() =>
      renderGauge({
        thresholds: [{ end: 10, label: 'bad', start: 20 }],
        value: 5,
        width: 5,
      }),
    ).toThrow(RangeError);
  });
});
