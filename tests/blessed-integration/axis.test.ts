import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { axis } from '@/adapters/blessed/axis.js';

describe('Blessed Axis adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = axis({
        box: { height: 2, width: 11 },
        data: { max: 10, min: 0, tickCount: 3 },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('┬────┬────┬\n0    5   10');
      component.setData({ max: 100, min: 0, tickCount: 3, width: 11 });
      expect(component.element.getContent()).toBe('┬────┬────┬\n0   50  100');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
