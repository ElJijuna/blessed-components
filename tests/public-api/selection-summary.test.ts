import { describe, expect, it } from 'vitest';

import {
  ACTION_BAR_ASCII_CHARACTERS,
  renderSelectionSummary,
  renderSelectionSummaryModel,
} from '@/index.js';

describe('SelectionSummary', () => {
  const actions = [
    { id: 'export', label: 'Export', shortcut: 'E' },
    { id: 'delete', label: 'Delete', shortcut: 'D', tone: 'danger' },
  ] as const;

  it('renders selection context and bulk actions', () => {
    expect(
      renderSelectionSummary({
        actions,
        activeActionId: 'export',
        detail: '2 hidden',
        noun: 'row',
        selectedCount: 3,
        totalCount: 12,
        width: 80,
      }),
    ).toBe('3 of 12 rows selected · 2 hidden │ ▸Export [E]◂  Delete [D]');
  });

  it('disables actions when selection is empty', () => {
    expect(
      renderSelectionSummary({
        actions,
        characters: ACTION_BAR_ASCII_CHARACTERS,
        noun: 'row',
        selectedCount: 0,
        totalCount: 12,
        width: 80,
      }),
    ).toBe('0 of 12 rows selected | (Export [E])  (Delete [D])');
  });

  it('reports visible actions under constrained width', () => {
    expect(
      renderSelectionSummaryModel({ actions, noun: 'row', selectedCount: 1, width: 36 }),
    ).toEqual({ content: '1 row selected │ Export [E] …', visibleActionIds: ['export'] });
  });

  it('sanitizes text and validates counts, noun, and width', () => {
    expect(
      renderSelectionSummary({
        detail: '{bold}visible{/bold}',
        noun: 'entry',
        selectedCount: 1,
        width: 40,
      }),
    ).toBe('1 entry selected · visible');
    expect(() => renderSelectionSummary({ selectedCount: -1, width: 20 })).toThrow(RangeError);
    expect(() => renderSelectionSummary({ selectedCount: 3, totalCount: 2, width: 20 })).toThrow(
      RangeError,
    );
    expect(() => renderSelectionSummary({ noun: '', selectedCount: 0, width: 20 })).toThrow(
      RangeError,
    );
    expect(() => renderSelectionSummary({ selectedCount: 0, width: -1 })).toThrow(RangeError);
  });
});
