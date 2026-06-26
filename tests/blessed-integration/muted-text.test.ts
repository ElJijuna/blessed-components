import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { mutedText } from '@/adapters/blessed/muted-text.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed MutedText adapter', () => {
  it('applies muted tone by default and updates safe content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        info: 'cyan',
        muted: 'blue',
      },
    });

    try {
      const component = mutedText({
        box: { height: 1, width: 14 },
        data: {
          capabilities: { colorLevel: 1 },
          content: '{bold}Updated{/bold} now',
          overflow: 'truncate',
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Updated now');
      expect(component.element.style.fg).toBe('blue');

      component.setData({
        capabilities: { colorLevel: 1 },
        content: 'Polling services',
        overflow: 'truncate',
        theme,
        tone: 'info',
      });

      expect(component.element.getContent()).toBe('Polling servi…');
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
        muted: 'grey',
      },
    });

    try {
      const component = mutedText({
        box: { border: 'line', height: 3, width: 12 },
        data: {
          backgroundTone: 'background',
          borderTone: 'border',
          capabilities: { colorLevel: 1 },
          content: 'No activity',
          overflow: 'truncate',
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('No activi…');
      expect(component.element.style.bg).toBe('black');
      expect(component.element.style.border?.fg).toBe('magenta');
      expect(component.element.style.fg).toBe('grey');
    } finally {
      screen.destroy();
    }
  });
});
