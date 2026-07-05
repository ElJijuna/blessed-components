import { describe, expect, it } from 'vitest';

import { renderStackedGauge, STACKED_GAUGE_ASCII_CHARACTERS } from '@/index.js';

describe('StackedGauge', () => {
  it('renders a stacked gauge with legend percentages', () => {
    expect(
      renderStackedGauge({
        label: 'Capacity',
        segments: [
          { id: 'used', label: 'Used', value: 6 },
          { id: 'reserved', label: 'Reserved', value: 2 },
        ],
        total: 10,
        width: 10,
      }),
    ).toBe('Capacity [██████▓▓░░]\n█ Used 60%\n▓ Reserved 20%');
  });

  it('supports ASCII characters, custom formatting, and hidden legend', () => {
    expect(
      renderStackedGauge({
        characters: {
          empty: '-',
          leftCap: '<',
          rightCap: '>',
          segments: STACKED_GAUGE_ASCII_CHARACTERS,
        },
        formatValue: ({ value }) => `${value} jobs`,
        segments: [
          { id: 'done', label: 'Done', value: 3 },
          { id: 'queued', label: 'Queued', value: 2 },
        ],
        showLegend: false,
        total: 10,
        width: 10,
      }),
    ).toBe('<###==----->');
  });

  it('sanitizes labels and formatted values', () => {
    expect(
      renderStackedGauge({
        formatValue: () => '\u001B[31m{red-fg}ready{/red-fg}\u001B[0m',
        label: '{bold}Deploy{/bold}',
        segments: [{ id: 'ready', label: '{green-fg}Ready{/green-fg}', value: 1 }],
        width: 4,
      }),
    ).toBe('Deploy [████]\n█ Ready ready');
  });

  it('rejects invalid segments, dimensions, characters, totals, and values', () => {
    expect(() => renderStackedGauge({ segments: [], width: 4 })).toThrow(RangeError);
    expect(() =>
      renderStackedGauge({ segments: [{ id: 'bad', label: ' ', value: 1 }], width: 4 }),
    ).toThrow(RangeError);
    expect(() =>
      renderStackedGauge({ segments: [{ id: 'bad', label: 'Bad', value: -1 }], width: 4 }),
    ).toThrow(RangeError);
    expect(() =>
      renderStackedGauge({
        segments: [{ id: 'bad', label: 'Bad', value: 2 }],
        total: 1,
        width: 4,
      }),
    ).toThrow(RangeError);
    expect(() =>
      renderStackedGauge({
        characters: { empty: '-', leftCap: '[', rightCap: ']', segments: ['OK'] },
        segments: [{ id: 'bad', label: 'Bad', value: 1 }],
        width: 4,
      }),
    ).toThrow(RangeError);
  });
});
