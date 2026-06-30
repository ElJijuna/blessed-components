import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { cluster } from '@/adapters/blessed/cluster.js';

describe('Blessed Cluster adapter', () => {
  it('wraps direct children and updates alignment without replacing elements', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = cluster({
        box: { height: 5, width: 14 },
        data: { gap: 1 },
        parent: screen,
      });
      const first = blessed.box({ height: 1, parent: component.element, width: 6 });
      const second = blessed.box({ height: 2, parent: component.element, width: 7 });
      const third = blessed.box({ height: 1, parent: component.element, width: 5 });

      component.layout();

      expect(first.position).toMatchObject({ height: 1, left: 0, top: 0, width: 6 });
      expect(second.position).toMatchObject({ height: 2, left: 7, top: 0, width: 7 });
      expect(third.position).toMatchObject({ height: 1, left: 0, top: 3, width: 5 });

      component.setData({ align: 'end', gap: 1 });

      expect(third.position).toMatchObject({ height: 1, left: 9, top: 3, width: 5 });
    } finally {
      screen.destroy();
    }
  });
});
