import { describe, expect, it, vi } from 'vitest';

import { createSpotlightState, filterSpotlightItems, renderSpotlightStatus } from '@/index.js';

describe('Spotlight', () => {
  it('manages uncontrolled open and query state', () => {
    const onOpenChange = vi.fn();
    const onQueryChange = vi.fn();
    const spotlight = createSpotlightState({
      defaultOpen: false,
      defaultQuery: '',
      onOpenChange,
      onQueryChange,
    });

    expect(spotlight.isOpen()).toBe(false);
    expect(spotlight.open()).toBe(true);
    expect(spotlight.setQuery('deploy')).toBe('deploy');
    expect(spotlight.close()).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(onQueryChange).toHaveBeenCalledWith('deploy');
  });

  it('keeps controlled state unchanged until new options arrive', () => {
    const onQueryChange = vi.fn();
    const spotlight = createSpotlightState({
      onQueryChange,
      open: false,
      query: '',
    });

    expect(spotlight.open()).toBe(false);
    expect(spotlight.setQuery('logs')).toBe('');
    expect(onQueryChange).toHaveBeenCalledWith('logs');

    spotlight.setOptions({ open: true, query: 'logs' });

    expect(spotlight.isOpen()).toBe(true);
    expect(spotlight.query()).toBe('logs');
  });

  it('filters by label, id, shortcut, and keywords without mutating items', () => {
    const items = [
      { id: 'deploy', keywords: ['release'], label: 'Deploy service', shortcut: 'd' },
      { id: 'logs', label: 'Open logs', shortcut: 'l' },
      { id: 'settings', label: 'Settings' },
    ] as const;

    expect(filterSpotlightItems({ items, query: 'rel' }).map(({ id }) => id)).toEqual(['deploy']);
    expect(filterSpotlightItems({ items, limit: 1, query: '' }).map(({ id }) => id)).toEqual([
      'deploy',
    ]);
    expect(items).toHaveLength(3);
    expect(() => filterSpotlightItems({ items, limit: -1 })).toThrow(RangeError);
  });

  it('renders status text safely and within width', () => {
    expect(
      renderSpotlightStatus({ count: 2, query: '{bold}deploy{/bold}', total: 5, width: 18 }),
    ).toBe('2 of 5 actions fo…');
    expect(() => renderSpotlightStatus({ count: 0, total: 0, width: -1 })).toThrow(RangeError);
  });
});
