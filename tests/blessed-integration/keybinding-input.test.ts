import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { keybindingInput } from '@/adapters/blessed/keybinding-input.js';

describe('Blessed KeybindingInput adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = keybindingInput({
        box: { height: 1, width: 30 },
        data: { keys: ['ctrl-k'] },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('○ Ctrl+K');
      component.setData({ keys: ['shift-enter'], recording: true });
      expect(component.element.getContent()).toBe('● Shift+Enter');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
