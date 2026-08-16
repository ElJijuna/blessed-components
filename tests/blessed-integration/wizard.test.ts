import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { wizard } from '@/adapters/blessed/wizard.js';

describe('Blessed Wizard adapter', () => {
  it('renders a page, navigates by keyboard, updates, focuses, and completes', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onComplete = vi.fn();

    try {
      const component = wizard({
        box: { height: 10, width: 50 },
        data: {
          capabilities: { colorLevel: 0, unicode: false },
          id: 'page-wizard',
          onComplete,
          steps: [
            { content: 'Pick a target.', id: 'target', label: 'Target' },
            { content: 'Confirm setup.', id: 'review', label: 'Review' },
          ],
        },
        parent: screen,
      });

      expect(component.element.getContent()).toContain('> Target  - Review');
      component.element.emit('keypress', undefined, { name: 'right' });
      expect(component.activeStep().id).toBe('review');
      expect(component.element.getContent()).toContain('Complete');
      component.element.emit('keypress', undefined, { name: 'enter' });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(component.status()).toBe('completed');
      component.focus();
      expect(screen.focused).toBe(component.element);
      component.setData({
        id: 'page-wizard',
        steps: [{ content: 'Updated.', id: 'review', label: 'Updated' }],
      });
      expect(component.element.getContent()).toContain('Updated');
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('cancels a modal on Escape and restores focus', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const previous = blessed.box({ keyable: true, parent: screen });
    const onCancel = vi.fn();

    try {
      previous.focus();

      const component = wizard({
        box: { border: 'line', height: 10, width: 50 },
        data: {
          capabilities: { colorLevel: 0, unicode: false },
          id: 'modal-wizard',
          onCancel,
          steps: [{ content: 'Configure.', id: 'setup', label: 'Setup' }],
        },
        mode: 'modal',
        parent: screen,
      });

      expect(screen.focused).toBe(component.element);
      expect(component.element.hidden).toBe(false);
      screen.emit('keypress', undefined, { name: 'escape' });
      expect(component.status()).toBe('cancelled');
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(component.element.hidden).toBe(true);
      expect(screen.focused).toBe(previous);

      component.reset();
      expect(component.status()).toBe('active');
      expect(component.element.hidden).toBe(false);
      component.destroy();
    } finally {
      screen.destroy();
    }
  });
});
