import { describe, expect, it } from 'vitest';

import { filterQuickSwitcherItems, renderQuickSwitcher } from '@/index.js';

describe('QuickSwitcher', () => {
  it('filters and renders resources', () => {
    const items = [
      { group: 'Views', id: 'logs', label: 'Logs', meta: 'live' },
      { group: 'Projects', id: 'api', label: 'API' },
    ];

    expect(filterQuickSwitcherItems(items, 'live').map(({ id }) => id)).toEqual(['logs']);
    expect(
      renderQuickSwitcher({
        activeId: 'logs',
        height: 3,
        items,
        query: 'log',
        width: 40,
      }),
    ).toBe('> log\n› Views / Logs - live');
  });
});
