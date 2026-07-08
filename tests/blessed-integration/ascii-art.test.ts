import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { asciiArt } from '@/adapters/blessed/ascii-art.js';

describe('Blessed AsciiArt adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = asciiArt({
        box: { height: 2, width: 6 },
        data: { align: 'center', art: 'hi\nthere' },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('  hi\nthere');
      component.setData({ align: 'right', art: 'hi' });
      expect(component.element.getContent()).toBe('    hi');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
