import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { slider } from '@/adapters/blessed/slider.js';

describe('Blessed Slider adapter', () => {
  it('updates an uncontrolled value through keyboard, wheel, and imperative controls', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();

    try {
      const component = slider({
        box: { height: 2, width: 24 },
        data: {
          defaultValue: 4,
          label: 'Volume',
          max: 10,
          min: 0,
          onValueChange,
          step: 2,
          width: 6,
        },
        parent: screen,
      });

      expect(component.value()).toBe(4);
      expect(component.element.getContent()).toBe('Volume:\n  ━━●─── 4');

      component.focus();
      component.increment();
      component.element.emit('keypress', undefined, { name: 'up' });
      component.element.emit('wheelup');

      expect(component.value()).toBe(10);
      expect(component.element.getContent()).toBe('Volume:\n› ━━━━━● 10');
      expect(component.increment()).toBe(false);

      component.element.emit('keypress', undefined, { name: 'home' });
      expect(component.value()).toBe(0);

      component.element.emit('keypress', undefined, { name: 'end' });
      component.element.emit('wheeldown');
      expect(component.value()).toBe(8);
      expect(onValueChange).toHaveBeenLastCalledWith(8);

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps a controlled value unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();

    try {
      const component = slider({
        data: { label: 'Zoom', onValueChange, value: 25, width: 5 },
        parent: screen,
      });

      expect(component.setValue(50)).toBe(true);
      expect(onValueChange).toHaveBeenCalledWith(50);
      expect(component.value()).toBe(25);

      component.setData({ label: 'Zoom', onValueChange, value: 50, width: 5 });

      expect(component.value()).toBe(50);
      expect(component.element.getContent()).toBe('Zoom:\n  ━━●── 50');
    } finally {
      screen.destroy();
    }
  });

  it('selects the nearest step from a track click', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = slider({
        data: { defaultValue: 0, label: 'Opacity', step: 10, width: 11 },
        parent: screen,
      });

      component.element.emit('click', { x: 7, y: 1 });

      expect(component.value()).toBe(50);
      expect(component.element.getContent()).toBe('Opacity:\n› ━━━━━●───── 50');
    } finally {
      screen.destroy();
    }
  });

  it('blocks focus and changes while disabled', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();

    try {
      const previous = blessed.box({ parent: screen });

      previous.focus();
      const component = slider({
        data: { defaultValue: 20, disabled: true, label: 'Volume', onValueChange, width: 5 },
        parent: screen,
      });

      component.focus();

      expect(screen.focused).not.toBe(component.element);
      expect(component.increment()).toBe(false);
      expect(component.setValue(80)).toBe(false);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.keyable).not.toContain(component.element);
      expect(screen.clickable).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
