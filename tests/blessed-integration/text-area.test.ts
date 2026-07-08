import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { textArea } from '@/adapters/blessed/text-area.js';

describe('Blessed TextArea adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = textArea({
        box: { height: 2, width: 20 },
        data: { lineNumbers: true, value: 'alpha\nbeta' },
        parent: screen,
      });

      expect(component.element.getContent()).toBe(' 1 alpha\n 2 beta');
      component.setData({ cursorLine: 1, lineNumbers: true, value: 'alpha\nbeta' });
      expect(component.element.getContent()).toBe(' 1 alpha\n›2 beta');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
