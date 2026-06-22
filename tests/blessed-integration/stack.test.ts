import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { stack } from '@/adapters/blessed/stack.js';

describe('Blessed Stack adapter', () => {
  it('lays out direct children and updates direction without replacing elements', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = stack({
        box: { height: 10, width: 20 },
        data: { gap: 1 },
        parent: screen,
      });
      const first = blessed.box({
        height: 2,
        parent: component.element,
        width: 4,
      });
      const second = blessed.box({
        height: 3,
        parent: component.element,
        width: 6,
      });

      component.layout();

      expect(first.position).toMatchObject({ height: 2, left: 0, top: 0, width: 20 });
      expect(second.position).toMatchObject({ height: 3, left: 0, top: 3, width: 20 });

      component.setData({
        align: 'center',
        direction: 'horizontal',
        gap: 2,
      });

      expect(first.position).toMatchObject({ height: 2, left: 0, top: 4, width: 4 });
      expect(second.position).toMatchObject({ height: 3, left: 6, top: 3, width: 6 });
    } finally {
      screen.destroy();
    }
  });
});
