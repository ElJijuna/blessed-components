import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { colorSwatch } from '@/adapters/blessed/color-swatch.js';

describe('Blessed ColorSwatch adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = colorSwatch({
        box: { height: 1, width: 30 },
        data: { color: '#3b82f6', label: 'Primary' },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('■ Primary #3b82f6');
      component.setData({ color: '#ef4444', label: 'Danger' });
      expect(component.element.getContent()).toBe('■ Danger #ef4444');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
