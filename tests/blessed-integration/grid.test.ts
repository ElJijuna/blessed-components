import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { grid } from '@/adapters/blessed/grid.js';

describe('Blessed Grid adapter', () => {
  it('lays out direct children and updates placement without replacing elements', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = grid({
        box: { height: 5, width: 14 },
        data: { columns: 3, gap: 1 },
        parent: screen,
      });
      const first = blessed.box({ parent: component.element });
      const second = blessed.box({ parent: component.element });
      const third = blessed.box({ parent: component.element });

      component.layout();

      expect(first.position).toMatchObject({ height: 5, left: 0, top: 0, width: 4 });
      expect(second.position).toMatchObject({ height: 5, left: 5, top: 0, width: 4 });
      expect(third.position).toMatchObject({ height: 5, left: 10, top: 0, width: 4 });

      component.setData({
        columns: 3,
        gap: 1,
        items: [{ columnSpan: 2 }, { column: 2, row: 0 }, { column: 0, columnSpan: 3, row: 1 }],
        rows: 2,
      });

      expect(first.position).toMatchObject({ height: 2, left: 0, top: 0, width: 9 });
      expect(second.position).toMatchObject({ height: 2, left: 10, top: 0, width: 4 });
      expect(third.position).toMatchObject({ height: 2, left: 0, top: 3, width: 14 });
    } finally {
      screen.destroy();
    }
  });
});
