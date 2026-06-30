import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { spacer } from '@/adapters/blessed/spacer.js';

describe('Blessed Spacer adapter', () => {
  it('sizes itself from parent dimensions and updates data', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const parent = blessed.box({ height: 8, parent: screen, width: 20 });
      const gap = spacer({
        data: { axis: 'vertical', size: 2 },
        parent,
      });

      expect(gap.element.position).toMatchObject({ height: 2, width: 20 });

      gap.setData({
        axis: 'horizontal',
        crossAxis: 'collapse',
        size: 6,
      });

      expect(gap.element.position).toMatchObject({ height: 0, width: 6 });
    } finally {
      screen.destroy();
    }
  });
});
