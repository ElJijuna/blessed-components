import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { commandPalette } from '@/adapters/blessed/command-palette.js';

describe('Blessed CommandPalette adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = commandPalette({
        box: { height: 2, width: 30 },
        data: { items: [{ id: 'open', label: 'Open' }] },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('> Type a command\n  Open');
      component.setData({ activeId: 'open', items: [{ id: 'open', label: 'Open' }], query: 'o' });
      expect(component.element.getContent()).toBe('> o\n› Open');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
