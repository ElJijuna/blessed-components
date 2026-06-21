import { describe, expect, it } from 'vitest';

import { diffRows, type RenderModel, renderToString } from '../../src/core/index.js';

describe('core render model', () => {
  it('renders rows and cells into plain text', () => {
    const model: RenderModel = {
      rows: [
        { cells: [{ text: 'Status' }, { text: 'Ready', width: 7, align: 'right' }] },
        { cells: [{ text: 'Done', colSpan: 2 }] },
      ],
      columnGap: 1,
    };

    expect(renderToString(model)).toBe('Status   Ready\nDone');
  });

  it('reports changed row indexes', () => {
    expect(diffRows(['one', 'two'], ['one', 'changed', 'three'])).toEqual([1, 2]);
  });
});
