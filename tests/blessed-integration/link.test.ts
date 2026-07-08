import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { link } from '@/adapters/blessed/link.js';

describe('Blessed Link adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = link({
        box: { height: 1, width: 40 },
        data: { label: 'Docs', url: 'https://example.com/docs' },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Docs <https://example.com/docs>');
      component.setData({ label: 'Docs', showUrl: false, url: 'https://example.com/docs' });
      expect(component.element.getContent()).toBe('Docs');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
