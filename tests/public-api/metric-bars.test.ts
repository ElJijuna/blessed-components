import { describe, expect, it } from 'vitest';

import { renderMetricBars } from '../../src/index.js';

describe('MetricBars', () => {
  it('renders aligned labeled metrics in input order', () => {
    expect(
      renderMetricBars({
        barWidth: 4,
        metrics: [
          { label: 'Quality', value: 50 },
          { label: 'Popularity', value: 100 },
        ],
      }),
    ).toBe('Quality    ██░░ 50%\nPopularity ████ 100%');
  });

  it('renders an optional overall heading separated from metrics', () => {
    expect(
      renderMetricBars({
        barWidth: 4,
        label: 'Overall',
        metrics: [{ label: 'Quality', value: 75 }],
        value: '85%',
      }),
    ).toBe('Overall 85%\n\nQuality ███░ 75%');
  });

  it('shares custom ranges and ASCII characters across rows', () => {
    expect(
      renderMetricBars({
        barWidth: 5,
        characters: { empty: '-', filled: '#' },
        max: 20,
        metrics: [{ label: 'Workers', value: 15 }],
        min: 10,
      }),
    ).toBe('Workers ###-- 50%');
  });

  it('formats each metric using public context', () => {
    expect(
      renderMetricBars({
        barWidth: 4,
        formatValue: ({ metric, value }) => `${value}${metric.unit}`,
        metrics: [{ label: 'Latency', unit: 'ms', value: 25 }],
      }),
    ).toBe('Latency █░░░ 25ms');
  });

  it('renders a documented empty state', () => {
    expect(renderMetricBars({ barWidth: 4, metrics: [] })).toBe('No metrics');
    expect(renderMetricBars({ barWidth: 4, emptyText: '-', metrics: [] })).toBe('-');
  });

  it('rejects invalid metric values while preserving caller data', () => {
    const metrics = [{ label: 'Quality', value: 50 }] as const;

    expect(() =>
      renderMetricBars({
        barWidth: 4,
        metrics: [{ label: 'Errors', value: Number.NaN }],
      }),
    ).toThrow(RangeError);
    expect(renderMetricBars({ barWidth: 4, metrics })).toBe('Quality ██░░ 50%');
    expect(metrics).toEqual([{ label: 'Quality', value: 50 }]);
  });
});
