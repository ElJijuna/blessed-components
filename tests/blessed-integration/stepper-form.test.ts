import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { stepperForm } from '@/adapters/blessed/stepper-form.js';

describe('Blessed StepperForm adapter', () => {
  it('renders, navigates, updates, focuses, and completes', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onComplete = vi.fn();

    try {
      const component = stepperForm({
        box: { height: 3, width: 50 },
        data: {
          capabilities: { colorLevel: 0, unicode: false },
          getValues: () => ({ ready: true }),
          onComplete,
          steps: [
            { id: 'setup', label: 'Setup' },
            { id: 'confirm', label: 'Confirm' },
          ],
        },
        parent: screen,
      });

      expect(component.element.getContent()).toContain('> Setup  - Confirm');
      component.element.emit('keypress', undefined, { name: 'right' });
      expect(component.activeStep().id).toBe('confirm');
      expect(component.element.getContent()).toContain('Complete');
      component.element.emit('keypress', undefined, { name: 'enter' });
      expect(onComplete).toHaveBeenCalledWith({ ready: true });
      component.focus();
      expect(screen.focused).toBe(component.element);
      component.setData({ getValues: () => ({}), steps: [{ id: 'confirm', label: 'Review' }] });
      expect(component.element.getContent()).toContain('Review');
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
