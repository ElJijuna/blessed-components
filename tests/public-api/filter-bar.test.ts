import { describe, expect, it } from 'vitest';

import { FILTER_BAR_ASCII_CHARACTERS, renderFilterBar, renderFilterBarModel } from '@/index.js';

describe('FilterBar', () => {
  const filters = [
    { id: 'status', label: 'Status', value: 'open' },
    { id: 'owner', label: 'Owner', removable: false, value: 'me' },
  ] as const;

  it('renders query, filters, result metadata, and actions', () => {
    expect(
      renderFilterBar({
        activeTarget: 'filter:status',
        filters,
        query: 'bug',
        resultCount: 12,
        showReset: true,
        width: 100,
      }),
    ).toBe('/ bug │ ▸[Status: open ×]◂ │ [Owner: me] │ 12 results │ Clear │ Reset');
  });

  it('uses ASCII fallback and singular result text', () => {
    expect(
      renderFilterBar({
        characters: FILTER_BAR_ASCII_CHARACTERS,
        filters: [filters[0]],
        resultCount: 1,
        width: 80,
      }),
    ).toBe('[Status: open x] | 1 result | Clear');
  });

  it('reports visible targets and overflow in narrow widths', () => {
    const result = renderFilterBarModel({
      filters,
      query: 'bug',
      resultCount: 12,
      showReset: true,
      width: 28,
    });

    expect(result.content).toContain('…');
    expect(result.visibleTargets).toEqual(['filter:status']);
  });

  it('sanitizes markup and validates data', () => {
    expect(
      renderFilterBar({
        filters: [{ id: 'x', label: '{bold}Type{/bold}', value: '\u001B[31mbug\u001B[0m' }],
        width: 50,
      }),
    ).toContain('[Type: bug ×]');
    expect(() => renderFilterBar({ width: -1 })).toThrow(RangeError);
    expect(() => renderFilterBar({ resultCount: -1, width: 10 })).toThrow(RangeError);
    expect(() =>
      renderFilterBar({ filters: [{ id: '', label: 'Bad', value: 'x' }], width: 10 }),
    ).toThrow(RangeError);
  });
});
