import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { passwordField } from '@/adapters/blessed/password-field.js';

describe('Blessed PasswordField adapter', () => {
  it('focuses, updates uncontrolled value, toggles reveal, submits, clears, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onRevealChange = vi.fn();
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = passwordField({
        box: { height: 4, width: 24 },
        data: {
          defaultValue: 'secret',
          hint: 'Ctrl-R reveals',
          label: 'Token',
          onRevealChange,
          onSubmit,
          onValueChange,
        },
        parent: screen,
      });

      expect(component.value()).toBe('secret');
      expect(component.revealed()).toBe(false);
      expect(component.element.getContent()).toBe('Token:\n******\n? Ctrl-R reveals');

      component.focus();
      component.setValue('rotated');
      component.toggleReveal();
      component.submit();

      expect(component.value()).toBe('rotated');
      expect(component.revealed()).toBe(true);
      expect(component.element.getContent()).toBe('Token:\n> rotated show\n? Ctrl-R reveals');
      expect(onValueChange).toHaveBeenCalledWith('rotated');
      expect(onRevealChange).toHaveBeenCalledWith(true);
      expect(onSubmit).toHaveBeenCalledWith('rotated');

      expect(component.clear()).toBe(true);
      expect(component.value()).toBe('');

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled value and reveal unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onRevealChange = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = passwordField({
        box: { height: 3, width: 18 },
        data: { label: 'Token', onRevealChange, onValueChange, reveal: false, value: 'secret' },
        parent: screen,
      });

      component.setValue('rotated');
      component.toggleReveal();

      expect(onValueChange).toHaveBeenCalledWith('rotated');
      expect(onRevealChange).toHaveBeenCalledWith(true);
      expect(component.value()).toBe('secret');
      expect(component.revealed()).toBe(false);
      expect(component.element.getContent()).toBe('Token:\n******');

      component.setData({
        label: 'Token',
        onRevealChange,
        onValueChange,
        reveal: true,
        value: 'rotated',
      });

      expect(component.value()).toBe('rotated');
      expect(component.revealed()).toBe(true);
      expect(component.element.getContent()).toBe('Token:\nrotated show');
    } finally {
      screen.destroy();
    }
  });

  it('toggles reveal on Ctrl-R and blocks interaction while disabled', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onRevealChange = vi.fn();
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = passwordField({
        box: { height: 3, width: 24 },
        data: {
          defaultValue: 'secret',
          label: 'Token',
          onRevealChange,
          onSubmit,
          onValueChange,
        },
        parent: screen,
      });

      component.element.emit('keypress', undefined, { full: 'C-r' });

      expect(component.revealed()).toBe(true);
      expect(onRevealChange).toHaveBeenCalledWith(true);

      component.setData({
        disabled: true,
        label: 'Token',
        onRevealChange,
        onSubmit,
        onValueChange,
        reveal: false,
        value: 'locked',
      });

      expect(component.setValue('open')).toBe(false);
      expect(component.setReveal(true)).toBe(false);
      expect(component.toggleReveal()).toBe(false);
      expect(component.submit()).toBe(false);
      expect(screen.keyable).not.toContain(component.element);
      expect(screen.clickable).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
