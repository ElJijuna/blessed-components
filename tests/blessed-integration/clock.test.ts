import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { clock } from '@/adapters/blessed/clock.js';

describe('Blessed Clock adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = clock({
        box: { height: 1, width: 40 },
        data: { label: 'UTC', timeZone: 'UTC', value: '2026-07-08T12:00:00Z' },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('UTC Jul 8, 2026, 12:00 PM');
      component.setData({ timeZone: 'UTC', value: '2026-07-08T13:00:00Z' });
      expect(component.element.getContent()).toBe('Jul 8, 2026, 1:00 PM');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
