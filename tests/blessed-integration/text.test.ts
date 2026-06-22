import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { text } from '@/adapters/blessed/text.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Text adapter', () => {
  it('applies semantic theme tones and updates safe content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        danger: 'magenta',
        muted: 'blue',
      },
    });

    try {
      const component = text({
        box: { height: 1, width: 12 },
        data: {
          capabilities: { colorLevel: 1 },
          content: '{red-fg}Status{/red-fg}',
          overflow: 'clip',
          theme,
          tone: 'muted',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Status');
      expect(component.element.style.fg).toBe('blue');

      component.setData({
        capabilities: { colorLevel: 1 },
        content: 'Failed',
        overflow: 'clip',
        theme,
        tone: 'danger',
      });

      expect(component.element.getContent()).toBe('Failed');
      expect(component.element.style.fg).toBe('magenta');
    } finally {
      screen.destroy();
    }
  });

  it('disables semantic color when terminal color is unavailable', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });

    try {
      const component = text({
        box: { height: 1, width: 8 },
        data: {
          capabilities: { colorLevel: 0 },
          content: 'Plain',
          tone: 'primary',
        },
        parent: screen,
      });

      expect(component.element.style.fg).toBeUndefined();
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
      const component = text({
        box: { border: 'line', height: 3, width: 12 },
        data: {
          backgroundTone: 'background',
          borderTone: 'border',
          capabilities: { colorLevel: 1 },
          content: 'Ready',
          theme,
        },
        parent: screen,
      });

      expect(component.element.style.bg).toBe('black');
      expect(component.element.style.border?.fg).toBe('magenta');
    } finally {
      screen.destroy();
    }
  });
});
