import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { checkbox } from '@/adapters/blessed/checkbox.js';
import { form } from '@/adapters/blessed/form.js';
import { textField } from '@/adapters/blessed/text-field.js';

describe('Blessed Form adapter', () => {
  it('registers component bindings, validates, submits, and resets', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onSubmit = vi.fn();
    const onValidation = vi.fn();
    const onReset = vi.fn();

    try {
      const component = form({
        data: { onReset, onSubmit, onValidation },
        parent: screen,
      });
      const environment = textField({
        box: { height: 3, width: 24 },
        data: { defaultValue: '', label: 'Environment' },
        parent: component.element,
      });
      const force = checkbox({
        box: { height: 1, width: 18 },
        data: { defaultChecked: false, label: 'Force' },
        parent: component.element,
      });

      component.registerField({
        defaultValue: '',
        getValue: environment.value,
        id: 'environment',
        setValue(value) {
          return environment.setValue(String(value ?? ''));
        },
        validate(value) {
          return value === '' ? 'Environment is required' : undefined;
        },
      });
      component.registerField({
        defaultValue: false,
        getValue: force.checked,
        id: 'force',
        setValue(value) {
          if (value !== force.checked()) {
            force.toggle();
          }
        },
      });

      expect(component.submit()).toEqual({
        errors: { environment: 'Environment is required' },
        ok: false,
        values: { environment: '', force: false },
      });
      expect(onSubmit).not.toHaveBeenCalled();

      environment.setValue('production');
      force.toggle();

      expect(component.submit()).toEqual({
        ok: true,
        values: { environment: 'production', force: true },
      });
      expect(onSubmit).toHaveBeenCalledWith({ environment: 'production', force: true });

      expect(component.reset()).toEqual({ environment: '', force: false });
      expect(environment.value()).toBe('');
      expect(force.checked()).toBe(false);
      expect(onReset).toHaveBeenCalledWith({ environment: '', force: false });
      expect(onValidation).toHaveBeenCalled();
    } finally {
      screen.destroy();
    }
  });

  it('delegates focus navigation and removes registered fields', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = form({ parent: screen });
      const first = blessed.textbox({ parent: component.element });
      const second = blessed.textbox({ parent: component.element });

      first.enableInput();
      second.enableInput();
      first.focus();

      component.focusNext();
      expect(screen.focused).toBe(second);

      component.focusPrevious();
      expect(screen.focused).toBe(first);

      component.registerField({ getValue: () => 'value', id: 'field' });
      expect(component.values()).toEqual({ field: 'value' });

      component.unregisterField('field');
      expect(component.values()).toEqual({});
    } finally {
      screen.destroy();
    }
  });
});
