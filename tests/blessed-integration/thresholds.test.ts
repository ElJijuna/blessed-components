import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { thresholds } from '@/adapters/blessed/thresholds.js';

describe('Blessed Thresholds adapter', () => {
  it('renders, updates, and destroys a thresholds element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = thresholds({
        box: { height: 1, width: 60 },
        data: {
          max: 100,
          min: 0,
          thresholds: [
            { end: 69, label: 'normal', tone: 'success' },
            { label: 'warning', start: 70, tone: 'warning' },
          ],
          value: 72,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('✓ normal 0..69  [! warning 70..100]');

      component.setData({
        max: 10,
        min: 0,
        thresholds: [{ label: 'all clear', tone: 'success' }],
      });

      expect(component.element.getContent()).toBe('✓ all clear 0..10');

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
