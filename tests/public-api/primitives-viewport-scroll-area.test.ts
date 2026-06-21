import { describe, expect, it, vi } from 'vitest';

import { createScrollArea, createViewport } from '../../src/primitives/index.js';

describe('viewport and scroll-area primitives', () => {
  it('clamps scrolling and preserves valid offsets after resize', () => {
    const viewport = createViewport({
      contentHeight: 100,
      contentWidth: 80,
      height: 20,
      width: 30,
    });

    expect(viewport.scrollTo({ x: 70, y: 95 })).toMatchObject({ x: 50, y: 80 });
    expect(viewport.resize({ height: 40, width: 60 })).toMatchObject({ x: 20, y: 60 });
    expect(viewport.scrollBy({ x: -5, y: -10 })).toMatchObject({ x: 15, y: 50 });
  });

  it('scrolls the minimum distance needed to reveal a rectangle', () => {
    const viewport = createViewport({
      contentHeight: 100,
      contentWidth: 100,
      height: 10,
      width: 20,
    });

    expect(viewport.ensureVisible({ height: 2, width: 4, x: 25, y: 12 })).toMatchObject({
      x: 9,
      y: 4,
    });
  });

  it('supports line, page, home, and end scrolling with metrics', () => {
    const onScroll = vi.fn();
    const area = createScrollArea({
      contentSize: 100,
      onScroll,
      pageOverlap: 2,
      viewportSize: 20,
    });

    expect(area.pageForward()).toBe(18);
    expect(area.lineForward(2)).toBe(20);
    expect(area.end()).toBe(80);
    expect(area.home()).toBe(0);
    expect(area.metrics()).toEqual({
      contentSize: 100,
      offset: 0,
      thumbOffset: 0,
      thumbSize: 4,
      viewportSize: 20,
    });
    expect(onScroll).toHaveBeenCalled();
  });

  it('reclamps scroll offsets when dimensions change', () => {
    const area = createScrollArea({ contentSize: 100, offset: 80, viewportSize: 20 });

    expect(area.setSizes({ contentSize: 40, viewportSize: 30 })).toBe(10);
    expect(area.pageBackward()).toBe(0);
  });
});
