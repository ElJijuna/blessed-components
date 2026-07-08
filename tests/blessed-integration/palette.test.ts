import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { palette } from '@/adapters/blessed/palette.js';

describe('Blessed Palette adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = palette({
        box: { height: 2, width: 30 },
        data: {
          items: [
            { color: '#3b82f6', id: 'primary', label: 'Primary' },
            { color: '#ef4444', id: 'danger', label: 'Danger' },
          ],
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('■ Primary #3b82f6\n■ Danger #ef4444');
      component.setData({ items: [{ color: '#22c55e', id: 'success', label: 'Success' }] });
      expect(component.element.getContent()).toBe('■ Success #22c55e');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
