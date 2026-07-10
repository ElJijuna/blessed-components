import { describe, expect, it } from 'vitest';

import { renderCandlestickChart } from '@/index.js';

describe('CandlestickChart', () => {
  it('renders OHLC rows with direction', () => {
    expect(
      renderCandlestickChart({ points: [{ close: 11, high: 12, label: 'D1', low: 9, open: 10 }] }),
    ).toBe('D1: O 10 H 12 L 9 C 11 up');
  });
});
