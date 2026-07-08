import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { quickSwitcher } from '@/adapters/blessed/quick-switcher.js';

describe('Blessed QuickSwitcher adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = quickSwitcher({
        box: { height: 2, width: 40 },
        data: { items: [{ group: 'Views', id: 'logs', label: 'Logs', meta: 'live' }] },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('> Switch to\n  Views / Logs - live');
      component.setData({
        activeId: 'logs',
        items: [{ group: 'Views', id: 'logs', label: 'Logs', meta: 'live' }],
        query: 'log',
      });
      expect(component.element.getContent()).toBe('> log\n› Views / Logs - live');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
