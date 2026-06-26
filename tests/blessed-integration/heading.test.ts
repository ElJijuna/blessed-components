import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { heading } from '@/adapters/blessed/heading.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Heading adapter', () => {
  it('applies semantic tones, bold defaults, and safe content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        primary: 'cyan',
      },
    });

    try {
      const component = heading({
        box: { height: 1, width: 14 },
        data: {
          capabilities: { colorLevel: 1 },
          content: '{bold}Deployments{/bold}',
          level: 1,
          theme,
          tone: 'primary',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('# Deployments');
      expect(component.element.style.fg).toBe('cyan');
      expect(component.element.style.bold).toBe(true);

      component.setData({
        capabilities: { colorLevel: 1 },
        content: 'Step details',
        level: 4,
        theme,
        tone: 'primary',
      });

      expect(component.element.getContent()).toBe('#### Step det…');
      expect(component.element.style.bold).toBe(false);
    } finally {
      screen.destroy();
    }
  });

  it('allows explicit bold and shared Box tones', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        background: 'black',
        border: 'magenta',
        muted: 'blue',
      },
    });

    try {
      const component = heading({
        box: { border: 'line', height: 3, width: 16 },
        data: {
          backgroundTone: 'background',
          bold: true,
          borderTone: 'border',
          capabilities: { colorLevel: 1 },
          content: 'Logs',
          level: 5,
          theme,
          tone: 'muted',
          underline: true,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('##### Logs\n--------------');
      expect(component.element.style.bg).toBe('black');
      expect(component.element.style.border?.fg).toBe('magenta');
      expect(component.element.style.fg).toBe('blue');
      expect(component.element.style.bold).toBe(true);
    } finally {
      screen.destroy();
    }
  });
});
