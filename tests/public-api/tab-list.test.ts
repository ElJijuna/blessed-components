import { describe, expect, it } from 'vitest';

import { renderTabList } from '@/index.js';

describe('TabList', () => {
  it('renders active, focused, disabled, safe text, and width truncation', () => {
    expect(
      renderTabList({
        activeId: 'logs',
        focusedId: 'logs',
        items: [
          { id: 'overview', label: 'Overview' },
          { id: 'logs', label: '{bold}Logs{/bold}' },
          { disabled: true, id: 'deploy', label: 'Deploy' },
        ],
        width: 32,
      }),
    ).toBe('   Overview  › <Logs>  × Deploy ');
  });

  it('renders empty text without mutating items', () => {
    const items = [] as const;

    expect(renderTabList({ emptyText: '没有触发器', items, width: 7 })).toBe('没有触…');
    expect(items).toEqual([]);
  });

  it('rejects invalid width, ids, and labels', () => {
    expect(() => renderTabList({ items: [], width: -1 })).toThrow(RangeError);
    expect(() => renderTabList({ items: [{ id: '', label: 'Bad' }], width: 10 })).toThrow(
      RangeError,
    );
    expect(() => renderTabList({ items: [{ id: 'bad', label: '' }], width: 10 })).toThrow(
      RangeError,
    );
  });
});
