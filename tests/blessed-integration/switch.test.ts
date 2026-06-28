import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { switchControl } from '@/adapters/blessed/switch.js';

describe('Blessed Switch adapter', () => {
  it('focuses and toggles through Enter, Space, click, and toggle()', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onCheckedChange = vi.fn();

    try {
      const component = switchControl({
        box: { width: 32 },
        data: { label: 'Auto deploy', onCheckedChange },
        parent: screen,
      });

      expect(component.checked()).toBe(false);
      expect(component.element.getContent()).toBe('○ Auto deploy: off');

      component.focus();
      component.element.emit('keypress', undefined, { name: 'enter' });
      component.element.emit('keypress', undefined, { name: 'space' });
      component.element.emit('click');

      expect(component.toggle()).toBe(true);
      expect(component.checked()).toBe(false);
      expect(onCheckedChange).toHaveBeenCalledTimes(4);
      expect(screen.keyable).toContain(component.element);
      expect(screen.clickable).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled state unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onCheckedChange = vi.fn();

    try {
      const component = switchControl({
        box: { width: 24 },
        data: { checked: false, label: 'Enabled', onCheckedChange },
        parent: screen,
      });

      component.setChecked(true);

      expect(onCheckedChange).toHaveBeenCalledWith(true);
      expect(component.checked()).toBe(false);
      expect(component.element.getContent()).toBe('○ Enabled: off');

      component.setData({ checked: true, label: 'Enabled', onCheckedChange });

      expect(component.checked()).toBe(true);
      expect(component.element.getContent()).toBe('● Enabled: on');
    } finally {
      screen.destroy();
    }
  });

  it('blocks focus and toggling while disabled', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onCheckedChange = vi.fn();

    try {
      const previous = blessed.box({ parent: screen });

      previous.focus();

      const component = switchControl({
        data: { disabled: true, label: 'Danger mode', onCheckedChange },
        parent: screen,
      });

      component.focus();

      expect(screen.focused).not.toBe(component.element);
      expect(component.toggle()).toBe(false);
      expect(onCheckedChange).not.toHaveBeenCalled();
      expect(screen.keyable).not.toContain(component.element);
      expect(screen.clickable).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
