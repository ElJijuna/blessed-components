import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';
import { keymapHelp } from '@/adapters/blessed/keymap-help.js';

describe('Blessed KeymapHelp adapter', () => {
  it('filters typed queries, clears, updates, focuses, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onQueryChange = vi.fn();

    try {
      const help = keymapHelp({
        box: { height: 8, width: 50 },
        data: {
          capabilities: { unicode: false },
          commands: [
            { description: 'Save file', id: 'save', keys: ['C-s'], scope: 'Editor' },
            { description: 'Open palette', id: 'palette', keys: ['C-p'], scope: 'Editor' },
          ],
          onQueryChange,
        },
        parent: screen,
      });

      help.element.emit('keypress', 's', { name: 's' });
      expect(help.query()).toBe('s');
      expect(help.element.getContent()).toContain('Save file');
      expect(help.element.getContent()).not.toContain('Open palette');
      help.clearQuery();
      expect(onQueryChange).toHaveBeenLastCalledWith('');
      help.focus();
      expect(screen.focused).toBe(help.element);
      help.setData({ commands: [{ description: 'Quit', id: 'quit', keys: ['q'], scope: 'App' }] });
      expect(help.element.getContent()).toContain('Quit');
      help.destroy();
      expect(screen.children).not.toContain(help.element);
    } finally {
      screen.destroy();
    }
  });
});
