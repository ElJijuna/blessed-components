import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { stackedGauge } from '@/adapters/blessed/stacked-gauge.js';

describe('Blessed StackedGauge adapter', () => {
  it('creates, updates, resizes, and destroys a stacked gauge', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const gauge = stackedGauge({
        box: { height: 4, width: 40 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          segments: [
            { id: 'used', label: 'Used', value: 6 },
            { id: 'free', label: 'Free', value: 4 },
          ],
          total: 10,
          width: 10,
        },
        parent: screen,
      });

      expect(gauge.element.getContent()).toBe('[######====]\n# Used 60%\n= Free 40%');

      gauge.setData({
        capabilities: { colorLevel: 1, unicode: false },
        label: 'Disk',
        segments: [{ id: 'used', label: 'Used', value: 5 }],
        total: 10,
        width: 10,
      });
      expect(gauge.element.getContent()).toBe('Disk [#####-----]\n# Used 50%');

      gauge.destroy();
      expect(screen.children).not.toContain(gauge.element);
    } finally {
      screen.destroy();
    }
  });
});
