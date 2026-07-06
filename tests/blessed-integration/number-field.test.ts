import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { numberField } from '@/adapters/blessed/number-field.js';

describe('Blessed NumberField adapter', () => {
  it('focuses, updates uncontrolled value, steps, submits, clears, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = numberField({
        box: { height: 4, width: 24 },
        data: {
          defaultValue: 3,
          hint: 'Use Up/Down',
          label: 'Replicas',
          max: 5,
          min: 0,
          onSubmit,
          onValueChange,
          step: 2,
        },
        parent: screen,
      });

      expect(component.value()).toBe(3);
      expect(component.element.getContent()).toBe('Replicas:\n3 -/+\n? Use Up/Down');

      component.focus();
      component.increment();
      component.increment();
      component.submit();

      expect(component.value()).toBe(5);
      expect(component.element.getContent()).toBe('Replicas:\n> 5 -/+\n? Use Up/Down');
      expect(onValueChange).toHaveBeenLastCalledWith(5);
      expect(onSubmit).toHaveBeenCalledWith(5);

      expect(component.clear()).toBe(true);
      expect(component.value()).toBeUndefined();

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled value unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();

    try {
      const component = numberField({
        box: { height: 3, width: 18 },
        data: { label: 'Replicas', onValueChange, value: 2 },
        parent: screen,
      });

      component.setValue(4);

      expect(onValueChange).toHaveBeenCalledWith(4);
      expect(component.value()).toBe(2);
      expect(component.element.getContent()).toBe('Replicas:\n2 -/+');

      component.setData({ label: 'Replicas', onValueChange, value: 4 });

      expect(component.value()).toBe(4);
      expect(component.element.getContent()).toBe('Replicas:\n4 -/+');
    } finally {
      screen.destroy();
    }
  });

  it('parses input, reports invalid input, handles arrow keys, and blocks disabled interaction', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onInvalidInput = vi.fn();
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = numberField({
        box: { height: 3, width: 24 },
        data: {
          defaultValue: 1,
          label: 'Replicas',
          max: 3,
          min: 0,
          onInvalidInput,
          onSubmit,
          onValueChange,
        },
        parent: screen,
      });

      expect(component.setInput('2')).toBe(true);
      expect(component.value()).toBe(2);

      component.element.emit('keypress', undefined, { name: 'up' });

      expect(component.value()).toBe(3);
      expect(component.setInput('9')).toBe(false);
      expect(onInvalidInput).toHaveBeenCalledWith('9', 'above-max');

      component.setData({
        disabled: true,
        label: 'Replicas',
        onInvalidInput,
        onSubmit,
        onValueChange,
        value: 2,
      });

      expect(component.setValue(1)).toBe(false);
      expect(component.increment()).toBe(false);
      expect(component.decrement()).toBe(false);
      expect(component.submit()).toBe(false);
      expect(screen.keyable).not.toContain(component.element);
      expect(screen.clickable).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
