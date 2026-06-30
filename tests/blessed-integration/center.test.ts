import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { center } from '@/adapters/blessed/center.js';

describe('Blessed Center adapter', () => {
  it('centers the first direct child and updates alignment', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = center({
        box: { height: 10, width: 20 },
        parent: screen,
      });
      const child = blessed.box({
        height: 4,
        parent: component.element,
        width: 8,
      });

      component.layout();

      expect(child.position).toMatchObject({ height: 4, left: 6, top: 3, width: 8 });

      component.setData({
        horizontal: 'end',
        vertical: 'stretch',
      });

      expect(child.position).toMatchObject({ height: 10, left: 12, top: 0, width: 8 });
    } finally {
      screen.destroy();
    }
  });
});
