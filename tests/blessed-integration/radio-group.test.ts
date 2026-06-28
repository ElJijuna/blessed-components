import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { radioGroup } from '@/adapters/blessed/radio-group.js';

describe('Blessed RadioGroup adapter', () => {
  it('navigates enabled options and selects the focused option', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();

    try {
      const component = radioGroup({
        box: { height: 3, width: 24 },
        data: {
          defaultValue: 'stable',
          items: [
            { id: 'stable', label: 'Stable' },
            { disabled: true, id: 'nightly', label: 'Nightly' },
            { id: 'beta', label: 'Beta' },
          ],
          onValueChange,
        },
        parent: screen,
      });

      component.element.emit('keypress', undefined, { name: 'down' });
      component.element.emit('keypress', undefined, { name: 'enter' });

      expect(component.activeId()).toBe('beta');
      expect(component.value()).toBe('beta');
      expect(onValueChange).toHaveBeenCalledWith('beta');
      expect(component.element.getContent()).toContain('› ● Beta');

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
    const items = [
      { id: 'stable', label: 'Stable' },
      { id: 'beta', label: 'Beta' },
    ] as const;

    try {
      const component = radioGroup({
        box: { height: 2, width: 24 },
        data: { items, onValueChange, value: 'stable' },
        parent: screen,
      });

      component.next();
      component.selectActive();

      expect(onValueChange).toHaveBeenCalledWith('beta');
      expect(component.value()).toBe('stable');
      expect(component.element.getContent()).toContain('● Stable');

      component.setData({ items, onValueChange, value: 'beta' });

      expect(component.value()).toBe('beta');
      expect(component.element.getContent()).toContain('● Beta');
    } finally {
      screen.destroy();
    }
  });
});
