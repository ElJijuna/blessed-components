import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { stat } from '../../src/adapters/blessed/stat.js';

describe('Blessed Stat adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const input = new PassThrough();
    const output = new PassThrough();
    const screen = blessed.screen({ input, output, terminal: 'xterm-256color' });

    try {
      const component = stat({
        box: { height: 3, width: 30 },
        data: { label: 'Errors', value: 4 },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Errors\n4');

      component.setData({
        label: 'Errors',
        trend: { direction: 'down', value: 2 },
        value: 2,
      });

      expect(component.element.getContent()).toBe('Errors\n2 ↓ 2');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
