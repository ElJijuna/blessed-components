import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { sparkline } from '../../src/adapters/blessed/sparkline.js';

describe('Blessed Sparkline adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const input = new PassThrough();
    const output = new PassThrough();
    const screen = blessed.screen({ input, output, terminal: 'xterm-256color' });

    try {
      const component = sparkline({
        box: { height: 2, width: 24 },
        data: { label: 'Load', values: [0, 50, 100], width: 3 },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Load\n▁▄█');

      component.setData({ label: 'Load', values: [100, 50, 0], width: 3 });

      expect(component.element.getContent()).toBe('Load\n█▄▁');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
