import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { trend } from '@/adapters/blessed/trend.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Trend adapter', () => {
  it('derives semantic tone from direction and updates safe content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        danger: 'red',
        success: 'green',
      },
    });

    try {
      const component = trend({
        box: { height: 1, width: 18 },
        data: {
          capabilities: { colorLevel: 1 },
          direction: 'up',
          label: '{bold}deploy{/bold}',
          theme,
          value: '12.5%',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('↑ 12.5% deploy');
      expect(component.element.style.fg).toBe('green');

      component.setData({
        capabilities: { colorLevel: 1 },
        direction: 'down',
        label: 'latency',
        theme,
        value: '8ms',
      });

      expect(component.element.getContent()).toBe('↓ 8ms latency');
      expect(component.element.style.fg).toBe('red');
    } finally {
      screen.destroy();
    }
  });

  it('uses explicit tone and shared Box tones', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        background: 'black',
        border: 'magenta',
        info: 'cyan',
      },
    });

    try {
      const component = trend({
        box: { border: 'line', height: 3, width: 16 },
        data: {
          backgroundTone: 'background',
          borderTone: 'border',
          capabilities: { colorLevel: 1 },
          direction: 'flat',
          mode: 'text',
          theme,
          tone: 'info',
          value: 0,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('flat 0');
      expect(component.element.style.bg).toBe('black');
      expect(component.element.style.border?.fg).toBe('magenta');
      expect(component.element.style.fg).toBe('cyan');
    } finally {
      screen.destroy();
    }
  });
});
