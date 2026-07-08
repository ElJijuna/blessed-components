import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { autocomplete } from '@/adapters/blessed/autocomplete.js';

describe('Blessed Autocomplete adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = autocomplete({
        box: { height: 2, width: 30 },
        data: { items: [{ id: 'ts', label: 'TypeScript' }] },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('> Type to search\n  TypeScript');
      component.setData({
        activeId: 'ts',
        items: [{ id: 'ts', label: 'TypeScript' }],
        query: 'type',
      });
      expect(component.element.getContent()).toBe('> type\n› TypeScript');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
