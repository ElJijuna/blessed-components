import { describe, expect, it } from 'vitest';

import { renderStat } from '@/index.js';

describe('Stat', () => {
  it('renders a label above its primary value', () => {
    expect(renderStat({ label: 'Downloads', value: '25.2M' })).toBe('Downloads\n25.2M');
  });

  it('appends a unit to the value and a description below it', () => {
    expect(
      renderStat({
        description: 'Across all packages',
        label: 'Storage',
        unit: 'GB',
        unitSeparator: ' ',
        value: 42,
      }),
    ).toBe('Storage\n42 GB\nAcross all packages');
  });

  it('renders an optional directional trend beside the value', () => {
    expect(
      renderStat({
        label: 'Revenue',
        trend: {
          direction: 'up',
          label: 'vs last month',
          value: '12.5%',
        },
        value: '$84K',
      }),
    ).toBe('Revenue\n$84K ↑ 12.5% vs last month');
  });

  it('supports compact inline layout', () => {
    expect(renderStat({ label: 'Overall', layout: 'inline', unit: '%', value: 85 })).toBe(
      'Overall 85%',
    );
  });

  it('supports custom trend characters for ASCII terminals', () => {
    expect(
      renderStat({
        label: 'Latency',
        trend: { direction: 'down', value: '8ms' },
        trendCharacters: { down: 'v', flat: '-', up: '^' },
        value: '120ms',
      }),
    ).toBe('Latency\n120ms v 8ms');
  });

  it('rejects non-finite numeric values and empty trend characters', () => {
    expect(() => renderStat({ label: 'Errors', value: Number.NaN })).toThrow(RangeError);
    expect(() =>
      renderStat({
        label: 'Errors',
        trend: { direction: 'flat', value: 0 },
        trendCharacters: { down: 'v', flat: '', up: '^' },
        value: 4,
      }),
    ).toThrow(RangeError);
  });
});
