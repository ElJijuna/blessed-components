import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { legend } from '@/adapters/blessed/legend.js';

describe('Blessed Legend adapter', () => {
  it('renders, updates, and destroys a legend element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = legend({
        box: { height: 2, width: 30 },
        data: {
          items: [
            { id: 'api', label: 'API', marker: '●' },
            { id: 'worker', label: 'Worker', marker: '■' },
          ],
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('● API  ■ Worker');

      component.setData({
        items: [{ description: 'critical', id: 'db', label: 'Database', marker: '▲' }],
      });

      expect(component.element.getContent()).toBe('▲ Database critical');

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
