import { describe, expect, it } from 'vitest';

import { ROUTE_TABS_ASCII_CHARACTERS, renderRouteTabs } from '@/index.js';

describe('RouteTabs', () => {
  const items = [
    { id: 'overview', label: 'Overview' },
    { closable: true, dirty: true, id: 'editor', label: 'Editor' },
    { closable: true, disabled: true, id: 'deploy', label: 'Deploy' },
  ] as const;

  it('renders the current, focused, dirty, disabled, and closeable routes', () => {
    expect(
      renderRouteTabs({
        characters: ROUTE_TABS_ASCII_CHARACTERS,
        focusedId: 'editor',
        items,
        routeId: 'overview',
      }),
    ).toBe('  [Overview]>* Editor x  - Deploy ');
  });

  it('sanitizes caller text, truncates by cells, and does not mutate items', () => {
    expect(
      renderRouteTabs({
        emptyText: '{bold}没有路由{/bold}',
        items: [],
        width: 7,
      }),
    ).toBe('没有路…');
    expect(renderRouteTabs({ items, separator: '\u001b[31m | \u001b[0m', width: 18 })).toBe(
      '   Overview | ● E…',
    );
    expect(items[1]?.dirty).toBe(true);
  });

  it('validates dimensions, route ids, labels, and duplicate routes', () => {
    expect(() => renderRouteTabs({ items, width: -1 })).toThrow(RangeError);
    expect(() => renderRouteTabs({ items: [{ id: '', label: 'Bad' }] })).toThrow(RangeError);
    expect(() => renderRouteTabs({ items: [{ id: 'bad', label: '' }] })).toThrow(RangeError);
    expect(() =>
      renderRouteTabs({
        items: [
          { id: 'same', label: 'One' },
          { id: 'same', label: 'Two' },
        ],
      }),
    ).toThrow(RangeError);
  });
});
