import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { histogram } from '@/adapters/blessed/histogram.js';

describe('Blessed Histogram adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = histogram({
        box: { height: 2, width: 20 },
        data: { barWidth: 4, binCount: 2, values: [1, 2, 3] },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('1-2 ██░░ 1\n2-3 ████ 2');
      component.setData({ barWidth: 4, binCount: 2, values: [1, 9] });
      expect(component.element.getContent()).toBe('1-5 ████ 1\n5-9 ████ 1');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
