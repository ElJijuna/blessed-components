import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { metricBars } from '@/adapters/blessed/metric-bars.js';
import { createTheme } from '@/core/theme.js';

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

  it('updates semantic color through the shared Box theme contract', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        primary: 'cyan',
        warning: 'yellow',
      },
    });

    try {
      const component = metricBars({
        box: { height: 2, width: 30 },
        data: {
          barWidth: 4,
          capabilities: { colorLevel: 1 },
          metrics: [{ label: 'CPU', value: 50 }],
          theme,
          tone: 'primary',
        },
        parent: screen,
      });

      expect(component.element.style.fg).toBe('cyan');

      component.setData({
        barWidth: 4,
        capabilities: { colorLevel: 1 },
        metrics: [{ label: 'CPU', value: 90 }],
        theme,
        tone: 'warning',
      });

      expect(component.element.style.fg).toBe('yellow');
    } finally {
      screen.destroy();
    }
  });
});
