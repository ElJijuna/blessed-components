import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { button } from '@/adapters/blessed/button.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Button adapter', () => {
  it('focuses and activates through Enter, Space, click, and press()', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onPress = vi.fn();

    try {
      const component = button({
        data: { label: 'Deploy', onPress },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('[ Deploy ]');

      component.focus();

      expect(screen.focused).toBe(component.element);
      expect(component.element.getContent()).toBe('› [ Deploy ]');

      component.element.emit('keypress', undefined, { name: 'enter' });
      component.element.emit('keypress', undefined, { name: 'space' });
      component.element.emit('click');

      expect(component.press()).toBe(true);
      expect(onPress).toHaveBeenCalledTimes(4);
      expect(screen.keyable).toContain(component.element);
      expect(screen.clickable).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
      expect(screen.keyable).not.toContain(component.element);
      expect(screen.clickable).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('blocks focus and every activation path while disabled', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const previous = blessed.box({ parent: screen });
    const onPress = vi.fn();

    try {
      previous.focus();

      const component = button({
        data: { disabled: true, label: 'Delete', onPress },
        parent: screen,
      });

      component.focus();

      expect(screen.focused).toBe(previous);
      expect(screen.keyable).not.toContain(component.element);
      expect(screen.clickable).not.toContain(component.element);
      expect(component.element.getContent()).toBe('[ Delete ] (disabled)');

      component.element.emit('keypress', undefined, { name: 'enter' });
      component.element.emit('click');

      expect(component.press()).toBe(false);
      expect(onPress).not.toHaveBeenCalled();
    } finally {
      screen.destroy();
    }
  });

  it('applies idle, focused, and disabled semantic theme states', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        background: 'black',
        foreground: 'white',
        muted: 'grey',
        primary: 'cyan',
      },
    });

    try {
      const component = button({
        data: {
          capabilities: { colorLevel: 1 },
          label: 'Save',
          theme,
        },
        parent: screen,
      });

      expect(component.element.style.fg).toBe('white');
      expect(component.element.style.bg).toBe('black');

      component.focus();

      expect(component.element.style.bg).toBe('cyan');

      component.setData({
        capabilities: { colorLevel: 1 },
        disabled: true,
        label: 'Save',
        theme,
      });

      expect(component.element.style.fg).toBe('grey');
      expect(screen.keyable).not.toContain(component.element);

      component.setData({
        capabilities: { colorLevel: 1 },
        label: 'Save',
        theme,
      });

      expect(screen.keyable).toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
