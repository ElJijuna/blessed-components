import { describe, expect, it } from 'vitest';

import { calculateCollapsibleLayout, renderCollapsibleHeader } from '@/index.js';

describe('Collapsible', () => {
  it('renders collapsed and expanded headers', () => {
    expect(renderCollapsibleHeader({ title: 'Details' })).toBe('▸ Details');
    expect(renderCollapsibleHeader({ expanded: true, title: 'Details' })).toBe('▾ Details');
  });

  it('renders focus, disabled, custom characters, and truncation cues', () => {
    expect(
      renderCollapsibleHeader({
        characters: { collapsed: '+', expanded: '-' },
        disabled: true,
        focused: true,
        title: 'Advanced options',
        width: 14,
      }),
    ).toBe('› + Advanced …');
  });

  it('removes ANSI sequences and Blessed tags from the title', () => {
    expect(renderCollapsibleHeader({ title: '{red-fg}\u001B[32mFilters\u001B[0m{/red-fg}' })).toBe(
      '▸ Filters',
    );
  });

  it('calculates collapsed layout without body height', () => {
    expect(calculateCollapsibleLayout({ bodyHeight: 4 })).toEqual({
      bodyHeight: 0,
      bodyTop: 1,
      bodyVisible: false,
      headerHeight: 1,
      totalHeight: 1,
    });
  });

  it('calculates expanded layout with a gap', () => {
    expect(calculateCollapsibleLayout({ bodyHeight: 4, expanded: true, gap: 1 })).toEqual({
      bodyHeight: 4,
      bodyTop: 2,
      bodyVisible: true,
      headerHeight: 1,
      totalHeight: 6,
    });
  });

  it('rejects invalid title, width, and layout dimensions', () => {
    expect(() => renderCollapsibleHeader({ title: '' })).toThrow(RangeError);
    expect(() => renderCollapsibleHeader({ title: 'Details', width: -1 })).toThrow(RangeError);
    expect(() => calculateCollapsibleLayout({ bodyHeight: -1 })).toThrow(RangeError);
    expect(() => calculateCollapsibleLayout({ bodyHeight: 1, gap: 1.5 })).toThrow(RangeError);
  });
});
