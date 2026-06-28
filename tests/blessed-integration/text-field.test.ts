import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { textField } from '@/adapters/blessed/text-field.js';

describe('Blessed TextField adapter', () => {
  it('focuses, updates uncontrolled value, submits, clears, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = textField({
        box: { height: 4, width: 24 },
        data: {
          defaultValue: 'production',
          hint: 'Deploy target',
          label: 'Environment',
          onSubmit,
          onValueChange,
        },
        parent: screen,
      });

      expect(component.value()).toBe('production');
      expect(component.element.getContent()).toBe('Environment:\nproduction\n? Deploy target');

      component.focus();
      component.setValue('staging');
      component.submit();

      expect(component.value()).toBe('staging');
      expect(component.element.getContent()).toBe('Environment:\n› staging\n? Deploy target');
      expect(onValueChange).toHaveBeenCalledWith('staging');
      expect(onSubmit).toHaveBeenCalledWith('staging');

      expect(component.clear()).toBe(true);
      expect(component.value()).toBe('');

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
      const component = textField({
        box: { height: 3, width: 18 },
        data: { label: 'Slug', onValueChange, value: 'prod' },
        parent: screen,
      });

      component.setValue('beta');

      expect(onValueChange).toHaveBeenCalledWith('beta');
      expect(component.value()).toBe('prod');
      expect(component.element.getContent()).toBe('Slug:\nprod');

      component.setData({ label: 'Slug', onValueChange, value: 'beta' });

      expect(component.value()).toBe('beta');
      expect(component.element.getContent()).toBe('Slug:\nbeta');
    } finally {
      screen.destroy();
    }
  });

  it('blocks focus and edits while disabled', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();

    try {
      const previous = blessed.box({ parent: screen });

      previous.focus();

      const component = textField({
        box: { height: 3, width: 24 },
        data: {
          disabled: true,
          label: 'Token',
          onSubmit,
          onValueChange,
          value: 'locked',
        },
        parent: screen,
      });

      component.focus();

      expect(screen.focused).not.toBe(component.element);
      expect(component.setValue('open')).toBe(false);
      expect(component.submit()).toBe(false);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.keyable).not.toContain(component.element);
      expect(screen.clickable).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
