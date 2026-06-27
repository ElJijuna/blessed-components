import { describe, expect, it } from 'vitest';

import { renderMultiSparkline } from '@/index.js';

describe('MultiSparkline', () => {
  it('renders aligned series with one shared domain', () => {
    expect(
      renderMultiSparkline({
        series: [
          { id: 'api', label: 'API', summary: 'peak 8', values: [1, 3, 5, 8] },
          { id: 'worker', label: 'Worker', values: [2, 2, 4, 6] },
        ],
        width: 4,
      }),
    ).toBe('API    ▁▃▅█ peak 8\nWorker ▂▂▄▆');
  });

  it('supports fixed label width and ASCII characters', () => {
    expect(
      renderMultiSparkline({
        characters: ['_', '-'],
        labelWidth: 3,
        series: [
          { id: 'alpha', label: 'Alpha', values: [0, 10] },
          { id: 'b', label: 'B', values: [10, 0] },
        ],
        width: 2,
      }),
    ).toBe('Al… _-\nB   -_');
  });

  it('renders empty text when there are no series or no samples', () => {
    expect(renderMultiSparkline({ series: [], width: 4 })).toBe('No series');
    expect(
      renderMultiSparkline({
        emptyText: 'No data',
        series: [{ id: 'x', label: 'X', values: [] }],
        width: 4,
      }),
    ).toBe('No data');
  });

  it('rejects invalid dimensions, labels, ids, values, and explicit domains', () => {
    expect(() => renderMultiSparkline({ series: [], width: 0 })).toThrow(RangeError);
    expect(() =>
      renderMultiSparkline({ series: [{ id: '', label: 'Bad', values: [1] }], width: 4 }),
    ).toThrow(RangeError);
    expect(() =>
      renderMultiSparkline({ series: [{ id: 'bad', label: '', values: [1] }], width: 4 }),
    ).toThrow(RangeError);
    expect(() =>
      renderMultiSparkline({
        series: [{ id: 'bad', label: 'Bad', values: [Number.NaN] }],
        width: 4,
      }),
    ).toThrow(RangeError);
    expect(() =>
      renderMultiSparkline({
        max: 1,
        min: 1,
        series: [{ id: 'bad', label: 'Bad', values: [1] }],
        width: 4,
      }),
    ).toThrow(RangeError);
  });
});
