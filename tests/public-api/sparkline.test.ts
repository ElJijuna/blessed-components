import { describe, expect, it } from 'vitest';

import { renderSparkline } from '../../src/index.js';

describe('Sparkline', () => {
  it('scales a numeric series across the default Unicode glyphs', () => {
    expect(renderSparkline({ values: [1, 2, 3, 4, 5, 6, 7, 8], width: 8 })).toBe('▁▂▃▄▅▆▇█');
  });

  it('renders constant series at the middle glyph without dividing by zero', () => {
    expect(renderSparkline({ values: [4, 4, 4], width: 3 })).toBe('▄▄▄');
  });

  it('uses an explicit domain when min and max are provided', () => {
    expect(renderSparkline({ values: [0, 50, 100], min: 0, max: 100, width: 3 })).toBe('▁▄█');
  });

  it('downsamples wider series while preserving bucket peaks', () => {
    expect(renderSparkline({ values: [1, 9, 2, 3], width: 2 })).toBe('█▂');
  });

  it('renders a documented empty state', () => {
    expect(renderSparkline({ values: [], width: 8 })).toBe('No data');
    expect(renderSparkline({ emptyText: '-', values: [], width: 8 })).toBe('-');
  });

  it('composes optional metadata and custom characters', () => {
    expect(
      renderSparkline({
        characters: ['.', ':', '#'],
        label: 'Downloads',
        summary: 'peak: 8',
        value: '25.2M',
        values: [0, 4, 8],
        width: 3,
      }),
    ).toBe('Downloads 25.2M\n.:# peak: 8');
  });

  it('rejects invalid dimensions, domains, characters, and values', () => {
    expect(() => renderSparkline({ values: [1], width: 0 })).toThrow(RangeError);
    expect(() => renderSparkline({ values: [1], min: 2, max: 2, width: 1 })).toThrow(RangeError);
    expect(() => renderSparkline({ characters: [], values: [1], width: 1 })).toThrow(RangeError);
    expect(() => renderSparkline({ values: [Number.NaN], width: 1 })).toThrow(RangeError);
  });
});
