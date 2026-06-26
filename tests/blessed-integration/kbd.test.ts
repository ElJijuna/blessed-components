import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { kbd } from '@/adapters/blessed/kbd.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Kbd adapter', () => {
  it('applies semantic tone and updates safe content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        foreground: 'white',
        primary: 'cyan',
      },
    });

    try {
      const component = kbd({
        box: { height: 1, width: 18 },
        data: {
          capabilities: { colorLevel: 1 },
          keys: '{bold}C-s{/bold}',
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('[Ctrl]+[S]');
      expect(component.element.style.fg).toBe('white');

      component.setData({
        capabilities: { colorLevel: 1 },
        keys: 'M-enter',
        theme,
        tone: 'primary',
      });

      expect(component.element.getContent()).toBe('[Alt]+[Enter]');
      expect(component.element.style.fg).toBe('cyan');
    } finally {
      screen.destroy();
    }
  });

  it('uses shared Box background and border tones', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        background: 'black',
        border: 'magenta',
      },
    });

    try {
      const component = kbd({
        box: { border: 'line', height: 3, width: 16 },
        data: {
          backgroundTone: 'background',
          borderTone: 'border',
          capabilities: { colorLevel: 1 },
          keys: ['C-s', 'C-c'],
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('[Ctrl]+[S] / …');
      expect(component.element.style.bg).toBe('black');
      expect(component.element.style.border?.fg).toBe('magenta');
    } finally {
      screen.destroy();
    }
  });
});
