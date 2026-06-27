import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { gauge } from '@/adapters/blessed/gauge.js';

describe('Blessed Gauge adapter', () => {
  it('renders, updates, and destroys a gauge element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = gauge({
        box: { height: 1, width: 30 },
        data: {
          label: 'CPU',
          thresholds: [{ label: 'warning', start: 70 }],
          value: 72,
          width: 10,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('CPU [███████░░░] 72% warning');

      component.setData({
        label: 'CPU',
        thresholds: [{ label: 'ok', end: 69 }],
        value: 30,
        width: 10,
      });

      expect(component.element.getContent()).toBe('CPU [███░░░░░░░] 30% ok');

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
