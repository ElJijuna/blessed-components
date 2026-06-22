import { describe, expect, it } from 'vitest';

import { renderScrollAreaScrollbar } from '@/index.js';

describe('ScrollArea', () => {
  it('renders a visible scrollbar thumb from public metrics', () => {
    expect(
      renderScrollAreaScrollbar({
        contentSize: 20,
        offset: 5,
        thumbOffset: 1,
        thumbSize: 2,
        viewportSize: 5,
      }),
    ).toBe('│\n█\n█\n│\n│');
  });

  it('hides an unnecessary scrollbar and supports ASCII characters', () => {
    expect(
      renderScrollAreaScrollbar({
        contentSize: 5,
        offset: 0,
        thumbOffset: 0,
        thumbSize: 5,
        viewportSize: 5,
      }),
    ).toBe('');
    expect(
      renderScrollAreaScrollbar({
        characters: { thumb: '#', track: '|' },
        contentSize: 10,
        offset: 0,
        thumbOffset: 0,
        thumbSize: 2,
        viewportSize: 4,
      }),
    ).toBe('#\n#\n|\n|');
  });

  it('rejects scrollbar characters that do not occupy one terminal cell', () => {
    expect(() =>
      renderScrollAreaScrollbar({
        characters: { thumb: '', track: '|' },
        contentSize: 10,
        offset: 0,
        thumbOffset: 0,
        thumbSize: 2,
        viewportSize: 4,
      }),
    ).toThrow(RangeError);
    expect(() =>
      renderScrollAreaScrollbar({
        characters: { thumb: '##', track: '|' },
        contentSize: 10,
        offset: 0,
        thumbOffset: 0,
        thumbSize: 2,
        viewportSize: 4,
      }),
    ).toThrow(RangeError);
  });
});
