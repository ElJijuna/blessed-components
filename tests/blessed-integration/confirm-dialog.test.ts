import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { confirmDialog } from '@/adapters/blessed/confirm-dialog.js';

describe('Blessed ConfirmDialog adapter', () => {
  it('opens with cancel focused and confirms through its handle', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const trigger = blessed.button({
      content: 'Open',
      height: 1,
      parent: screen,
      width: 10,
    });
    const onConfirm = vi.fn();
    const onResult = vi.fn();
    const onOpenChange = vi.fn();

    try {
      trigger.focus();

      const component = confirmDialog({
        data: {
          confirmLabel: 'Delete',
          defaultOpen: false,
          id: 'delete-confirm',
          message: 'This action cannot be undone.',
          onConfirm,
          onOpenChange,
          onResult,
          title: 'Delete service',
        },
        parent: screen,
      });

      component.open();

      expect(component.isOpen).toBe(true);
      expect(component.element.hidden).toBe(false);
      expect(screen.focused.getContent()).toBe('› [ Cancel ]');

      component.confirm();

      expect(onConfirm).toHaveBeenCalledOnce();
      expect(onResult).toHaveBeenCalledWith('confirm');
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
      expect(component.isOpen).toBe(false);
      expect(screen.focused).toBe(trigger);
    } finally {
      screen.destroy();
    }
  });

  it('treats Escape as cancel for the top dialog', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onCancel = vi.fn();
    const onResult = vi.fn();

    try {
      const component = confirmDialog({
        data: {
          defaultOpen: true,
          id: 'discard-confirm',
          message: 'Discard local changes?',
          onCancel,
          onResult,
          title: 'Discard changes',
        },
        parent: screen,
      });

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(onCancel).toHaveBeenCalledOnce();
      expect(onResult).toHaveBeenCalledWith('cancel');
      expect(component.isOpen).toBe(false);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled visibility unchanged until setData receives open state', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOpenChange = vi.fn();

    try {
      const component = confirmDialog({
        data: {
          id: 'controlled-confirm',
          onOpenChange,
          open: false,
          title: 'Run migration',
        },
        parent: screen,
      });

      component.open();

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(component.isOpen).toBe(false);
      expect(component.element.hidden).toBe(true);

      component.setData({
        id: 'controlled-confirm',
        onOpenChange,
        open: true,
        title: 'Run migration',
      });

      expect(component.isOpen).toBe(true);
      expect(component.element.hidden).toBe(false);
    } finally {
      screen.destroy();
    }
  });
});
