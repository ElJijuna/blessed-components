import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { multiSparkline } from '@/adapters/blessed/multi-sparkline.js';

describe('Blessed MultiSparkline adapter', () => {
  it('renders, updates, and destroys a multi-sparkline element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = multiSparkline({
        box: { height: 2, width: 40 },
        data: {
          series: [
            { id: 'api', label: 'API', values: [1, 3, 5, 8] },
            { id: 'worker', label: 'Worker', values: [2, 2, 4, 6] },
          ],
          width: 4,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('API    ▁▃▅█\nWorker ▂▂▄▆');

      component.setData({
        series: [{ id: 'api', label: 'API', summary: 'flat', values: [2, 2, 2] }],
        width: 3,
      });

      expect(component.element.getContent()).toBe('API ▄▄▄ flat');

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
