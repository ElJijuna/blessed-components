import { describe, expect, it } from 'vitest';

import { renderNavigationList } from '@/components/navigation/navigation-list/index.js';

describe('NavigationList', () => {
  it('renders active, focused, disabled, badges, width, and viewport', () => {
    expect(
      renderNavigationList({
        activeId: 'deployments',
        focusedId: 'logs',
        height: 3,
        items: [
          { id: 'overview', label: 'Overview' },
          { id: 'deployments', label: '{bold}Deployments{/bold}', badge: '12' },
          { id: 'logs', label: 'Logs', badge: 'live' },
          { disabled: true, id: 'settings', label: 'Settings' },
        ],
        width: 24,
      }),
    ).toBe('    Overview\n  ● Deployments       12\n›   Logs            live');
  });

  it('renders a cell-aware empty state without mutating items', () => {
    const items = [] as const;

    expect(renderNavigationList({ emptyText: '没有目标', height: 2, items, width: 5 })).toBe(
      '没有…',
    );
    expect(items).toEqual([]);
  });

  it('rejects invalid dimensions, ids, labels, and badges', () => {
    expect(() => renderNavigationList({ height: 1, items: [], width: -1 })).toThrow(RangeError);
    expect(() =>
      renderNavigationList({ height: 1, items: [{ id: '', label: 'Bad' }], width: 8 }),
    ).toThrow(RangeError);
    expect(() =>
      renderNavigationList({ height: 1, items: [{ id: 'bad', label: '' }], width: 8 }),
    ).toThrow(RangeError);
    expect(() =>
      renderNavigationList({
        height: 1,
        items: [{ badge: '', id: 'bad', label: 'Bad' }],
        width: 8,
      }),
    ).toThrow(RangeError);
  });
});
