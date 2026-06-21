import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { metricBars } from '../../src/adapters/blessed/metric-bars.js';

describe('Blessed MetricBars adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const input = new PassThrough();
    const output = new PassThrough();
    const screen = blessed.screen({ input, output, terminal: 'xterm-256color' });

    try {
      const component = metricBars({
        box: { height: 4, width: 40 },
        data: {
          barWidth: 4,
          label: 'Overall',
          metrics: [{ label: 'Quality', value: 50 }],
          value: '50%',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Overall 50%\n\nQuality ██░░ 50%');

      component.setData({
        barWidth: 4,
        label: 'Overall',
        metrics: [{ label: 'Quality', value: 75 }],
        value: '75%',
      });

      expect(component.element.getContent()).toBe('Overall 75%\n\nQuality ███░ 75%');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
