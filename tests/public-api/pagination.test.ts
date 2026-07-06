import { describe, expect, it } from 'vitest';

import {
  clampPaginationPage,
  createPaginationItems,
  renderPagination,
} from '@/components/navigation/pagination/index.js';

describe('Pagination', () => {
  it('creates a bounded model with controls, pages, and ellipses', () => {
    expect(
      createPaginationItems({
        page: 5,
        pageCount: 10,
        showBoundaryControls: true,
        siblingCount: 1,
      }),
    ).toEqual([
      { disabled: false, kind: 'control', label: 'first', page: 1, type: 'first' },
      { disabled: false, kind: 'control', label: 'previous', page: 4, type: 'previous' },
      { current: false, kind: 'page', label: '1', page: 1 },
      { kind: 'ellipsis', label: 'ellipsis' },
      { current: false, kind: 'page', label: '4', page: 4 },
      { current: true, kind: 'page', label: '5', page: 5 },
      { current: false, kind: 'page', label: '6', page: 6 },
      { kind: 'ellipsis', label: 'ellipsis' },
      { current: false, kind: 'page', label: '10', page: 10 },
      { disabled: false, kind: 'control', label: 'next', page: 6, type: 'next' },
      { disabled: false, kind: 'control', label: 'last', page: 10, type: 'last' },
    ]);
  });

  it('renders disabled controls, current page, custom characters, and width', () => {
    expect(
      renderPagination({
        characters: {
          ellipsis: '...',
          first: 'first',
          last: 'last',
          next: 'next',
          previous: 'prev',
        },
        page: 1,
        pageCount: 4,
        showBoundaryControls: true,
        width: 80,
      }),
    ).toBe('(first) (prev) [1] 2 ... 4 next last');

    expect(renderPagination({ page: 3, pageCount: 10, width: 12 })).toBe('‹ 1 2 [3] 4…');
  });

  it('clamps pages and rejects invalid options', () => {
    expect(clampPaginationPage(0, 5)).toBe(1);
    expect(clampPaginationPage(99, 5)).toBe(5);
    expect(() => renderPagination({ page: 1, pageCount: 0, width: 10 })).toThrow(RangeError);
    expect(() => renderPagination({ page: 1, pageCount: 2, siblingCount: -1, width: 10 })).toThrow(
      RangeError,
    );
    expect(() => renderPagination({ page: 1, pageCount: 2, width: -1 })).toThrow(RangeError);
  });
});
