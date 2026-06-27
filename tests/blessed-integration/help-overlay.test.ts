import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { helpOverlay } from '@/adapters/blessed/help-overlay.js';

describe('Blessed HelpOverlay adapter', () => {
  it('opens, filters typed query, clears, and closes on Escape', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOpenChange = vi.fn();
    const onQueryChange = vi.fn();

    try {
      const component = helpOverlay({
        box: { height: 8, width: 40 },
        data: {
          defaultOpen: false,
          onOpenChange,
          onQueryChange,
          sections: [
            {
              items: [
                { description: 'Save file', id: 'save', keys: ['C-s'] },
                { description: 'Open command palette', id: 'palette', keys: ['C-p'] },
              ],
              title: 'Editor',
            },
          ],
        },
        parent: screen,
      });

      expect(component.isOpen()).toBe(false);
      expect(component.element.hidden).toBe(true);

      component.open();
      component.element.emit('keypress', 's', { name: 's' });
      component.element.emit('keypress', 'a', { name: 'a' });

      expect(component.isOpen()).toBe(true);
      expect(component.query()).toBe('sa');
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onQueryChange).toHaveBeenLastCalledWith('sa');
      expect(component.element.getContent()).toContain('Search: sa');

      component.element.emit('keypress', undefined, { full: 'C-u', name: 'u' });

      expect(component.query()).toBe('');

      component.element.emit('keypress', undefined, { name: 'escape' });

      expect(component.isOpen()).toBe(false);
      expect(component.element.hidden).toBe(true);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled query unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onQueryChange = vi.fn();
    const sections = [
      {
        items: [{ description: 'Save file', id: 'save', keys: ['C-s'] }],
        title: 'Editor',
      },
    ] as const;

    try {
      const component = helpOverlay({
        box: { height: 6, width: 32 },
        data: { defaultOpen: true, onQueryChange, query: 's', sections },
        parent: screen,
      });

      component.setQuery('save');

      expect(onQueryChange).toHaveBeenCalledWith('save');
      expect(component.query()).toBe('s');
      expect(component.element.getContent()).toContain('Search: s');

      component.setData({ defaultOpen: true, onQueryChange, query: 'save', sections });

      expect(component.query()).toBe('save');
      expect(component.element.getContent()).toContain('Search: save');
    } finally {
      screen.destroy();
    }
  });
});
