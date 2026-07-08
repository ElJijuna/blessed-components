import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { combobox } from '@/adapters/blessed/combobox.js';

describe('Blessed Combobox adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = combobox({
        box: { height: 2, width: 30 },
        data: { items: [{ id: 'ts', label: 'TypeScript' }], open: true },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('▾ Search\n  ○ TypeScript');
      component.setData({
        activeId: 'ts',
        items: [{ id: 'ts', label: 'TypeScript' }],
        open: true,
        query: 'type',
        value: 'ts',
      });
      expect(component.element.getContent()).toBe('▾ type\n› ● TypeScript');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
