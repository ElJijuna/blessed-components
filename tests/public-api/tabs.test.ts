import { describe, expect, it } from 'vitest';

import { renderTabs } from '@/index.js';

describe('Tabs', () => {
  it('renders active, focused, disabled, safe text, and width truncation', () => {
    expect(
      renderTabs({
        activeId: 'logs',
        focusedId: 'logs',
        items: [
          { id: 'overview', label: 'Overview' },
          { id: 'logs', label: '{bold}Logs{/bold}' },
          { disabled: true, id: 'deploy', label: 'Deploy' },
        ],
        width: 32,
      }),
    ).toBe('   Overview  › [Logs]  × Deploy ');
  });

  it('renders empty text without mutating items', () => {
    const items = [] as const;

    expect(renderTabs({ emptyText: '没有标签', items, width: 7 })).toBe('没有标…');
    expect(items).toEqual([]);
  });

  it('rejects invalid width, ids, and labels', () => {
    expect(() => renderTabs({ items: [], width: -1 })).toThrow(RangeError);
    expect(() => renderTabs({ items: [{ id: '', label: 'Bad' }], width: 10 })).toThrow(RangeError);
    expect(() => renderTabs({ items: [{ id: 'bad', label: '' }], width: 10 })).toThrow(RangeError);
  });
});
