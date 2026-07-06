import { describe, expect, it } from 'vitest';

import { clampPagerPage, renderPager } from '@/components/navigation/pager/index.js';

describe('Pager', () => {
  it('renders previous, status, next, disabled state, and width', () => {
    expect(renderPager({ page: 1, pageCount: 4, width: 80 })).toBe('(Previous)  Page 1/4  Next ›');
    expect(renderPager({ page: 4, pageCount: 4, width: 80 })).toBe('‹ Previous  Page 4/4  (Next)');
    expect(renderPager({ page: 2, pageCount: 10, width: 16 })).toBe('‹ Previous  Pag…');
  });

  it('supports custom labels and status visibility', () => {
    expect(
      renderPager({
        labels: { next: 'Forward', previous: 'Back', statusSeparator: ' of ' },
        page: 2,
        pageCount: 5,
        separator: ' | ',
        width: 80,
      }),
    ).toBe('‹ Back | Page 2 of 5 | Forward ›');

    expect(renderPager({ page: 2, pageCount: 5, showStatus: false, width: 80 })).toBe(
      '‹ Previous  Next ›',
    );
  });

  it('clamps pages and rejects invalid options', () => {
    expect(clampPagerPage(0, 5)).toBe(1);
    expect(clampPagerPage(99, 5)).toBe(5);
    expect(() => renderPager({ page: 1, pageCount: 0, width: 10 })).toThrow(RangeError);
    expect(() => renderPager({ page: 1, pageCount: 2, width: -1 })).toThrow(RangeError);
  });
});
