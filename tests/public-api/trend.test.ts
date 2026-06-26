import { describe, expect, it } from 'vitest';

import { renderTrend } from '@/index.js';

describe('Trend', () => {
  it('renders a symbolic trend with value and context', () => {
    expect(
      renderTrend({
        direction: 'up',
        label: 'vs last month',
        value: '12.5%',
      }),
    ).toBe('↑ 12.5% vs last month');
  });

  it('supports text fallback and sanitizes dynamic content', () => {
    expect(
      renderTrend({
        direction: 'down',
        label: '{bold}today{/bold}',
        mode: 'text',
        value: '\u001B[31m8ms\u001B[0m',
      }),
    ).toBe('down 8ms today');
  });

  it('supports symbol plus text fallback and custom characters', () => {
    expect(
      renderTrend({
        characters: { down: 'v', flat: '-', up: '^' },
        direction: 'flat',
        mode: 'symbol-text',
        value: 0,
      }),
    ).toBe('- flat 0');
  });

  it('truncates one-line output by default', () => {
    expect(
      renderTrend({
        direction: 'up',
        label: 'over the previous deployment window',
        value: '12.5%',
        width: 16,
      }),
    ).toBe('↑ 12.5% over th…');
  });

  it('rejects non-finite values and empty fallback labels', () => {
    expect(() => renderTrend({ direction: 'up', value: Number.NaN })).toThrow(RangeError);
    expect(() =>
      renderTrend({
        direction: 'up',
        labels: { down: 'down', flat: 'flat', up: '' },
        mode: 'text',
      }),
    ).toThrow(RangeError);
  });
});
