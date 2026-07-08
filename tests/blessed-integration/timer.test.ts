import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { timer } from '@/adapters/blessed/timer.js';

describe('Blessed Timer adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = timer({
        box: { height: 1, width: 30 },
        data: { elapsed: 125_000, label: 'Build' },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Build 2m 5s');
      component.setData({ elapsed: 125_000, label: 'Build', paused: true });
      expect(component.element.getContent()).toBe('Build 2m 5s paused');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
