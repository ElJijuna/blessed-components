import { describe, expect, it } from 'vitest';

import { renderRadioGroup } from '@/index.js';

describe('RadioGroup', () => {
  it('renders focus, selected, disabled, safe labels, width, and viewport', () => {
    expect(
      renderRadioGroup({
        activeId: 'beta',
        height: 3,
        items: [
          { id: 'stable', label: 'Stable' },
          { id: 'beta', label: '{bold}Beta{/bold}' },
          { disabled: true, id: 'nightly', label: 'Nightly builds' },
        ],
        value: 'stable',
        width: 14,
      }),
    ).toBe('  ● Stable\n› ○ Beta\n  × Nightly b…');
  });

  it('renders a cell-aware empty state without mutating items', () => {
    const items = [] as const;

    expect(renderRadioGroup({ emptyText: '没有选项', height: 2, items, width: 5 })).toBe('没有…');
    expect(items).toEqual([]);
  });

  it('rejects invalid dimensions, ids, and labels', () => {
    expect(() => renderRadioGroup({ height: 1, items: [], width: -1 })).toThrow(RangeError);
    expect(() =>
      renderRadioGroup({ height: 1, items: [{ id: '', label: 'Bad' }], width: 8 }),
    ).toThrow(RangeError);
    expect(() =>
      renderRadioGroup({ height: 1, items: [{ id: 'bad', label: '' }], width: 8 }),
    ).toThrow(RangeError);
  });
});
