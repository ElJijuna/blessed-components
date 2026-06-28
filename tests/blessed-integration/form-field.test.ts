import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { formField } from '@/adapters/blessed/form-field.js';

describe('Blessed FormField adapter', () => {
  it('renders and updates composed field content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = formField({
        box: { height: 3, width: 28 },
        data: {
          control: '[ production ]',
          hint: 'Pick a deploy target',
          label: 'Environment',
          required: true,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe(
        'Environment *:\n[ production ]\n? Pick a deploy target',
      );

      component.setData({
        control: '[ staging ]',
        error: 'No deploy permission',
        label: 'Environment',
      });

      expect(component.element.getContent()).toBe(
        'Environment:\n[ staging ]\n! No deploy permission',
      );

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
