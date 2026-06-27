import { describe, expect, it } from 'vitest';

import { renderLegend } from '@/index.js';

describe('Legend', () => {
  it('renders horizontal items with markers and descriptions', () => {
    expect(
      renderLegend({
        items: [
          { description: '42%', id: 'api', label: 'API', marker: '●' },
          { description: '18%', id: 'worker', label: 'Worker', marker: '■' },
        ],
      }),
    ).toBe('● API 42%  ■ Worker 18%');
  });

  it('renders vertical items and truncates each line by terminal width', () => {
    expect(
      renderLegend({
        items: [
          { id: 'api', label: 'API gateway', marker: '●' },
          { id: 'worker', label: 'Background worker', marker: '■' },
        ],
        layout: 'vertical',
        width: 12,
      }),
    ).toBe('● API gatew…\n■ Backgroun…');
  });

  it('strips terminal markup from dynamic text and renders empty state', () => {
    expect(
      renderLegend({
        emptyText: '\u001B[31mNo {bold}series{/bold}\u001B[0m',
        items: [],
        width: 20,
      }),
    ).toBe('No series');
  });

  it('rejects invalid width and empty labels or markers', () => {
    expect(() => renderLegend({ items: [], width: -1 })).toThrow(RangeError);
    expect(() => renderLegend({ items: [{ id: 'bad', label: '' }] })).toThrow(RangeError);
    expect(() => renderLegend({ items: [{ id: 'bad', label: 'Bad', marker: '' }] })).toThrow(
      RangeError,
    );
  });
});
