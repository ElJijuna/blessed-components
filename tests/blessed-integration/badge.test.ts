import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { badge } from '../../src/adapters/blessed/badge.js';

describe('Blessed Badge adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const input = new PassThrough();
    const output = new PassThrough();
    const screen = blessed.screen({ input, output, terminal: 'xterm-256color' });

    try {
      const component = badge({
        box: { height: 1, width: 20 },
        data: { text: 'Queued', tone: 'info' },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('[i Queued]');

      component.setData({ text: 'Passed', tone: 'success' });

      expect(component.element.getContent()).toBe('[✓ Passed]');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
