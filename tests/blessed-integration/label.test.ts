import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { label } from '@/adapters/blessed/label.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Label adapter', () => {
  it('applies muted tone by default and updates safe content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        muted: 'blue',
        primary: 'cyan',
      },
    });

    try {
      const component = label({
        box: { height: 1, width: 14 },
        data: {
          capabilities: { colorLevel: 1 },
          content: '{bold}Project{/bold}',
          required: true,
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Project *:');
      expect(component.element.style.fg).toBe('blue');

      component.setData({
        capabilities: { colorLevel: 1 },
        content: 'Environment',
        theme,
        tone: 'primary',
      });

      expect(component.element.getContent()).toBe('Environment:');
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
      const component = label({
        box: { border: 'line', height: 3, width: 12 },
        data: {
          backgroundTone: 'background',
          borderTone: 'border',
          capabilities: { colorLevel: 1 },
          content: 'Status',
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Status:');
      expect(component.element.style.bg).toBe('black');
      expect(component.element.style.border?.fg).toBe('magenta');
      expect(component.element.style.fg).toBe('grey');
    } finally {
      screen.destroy();
    }
  });
});
