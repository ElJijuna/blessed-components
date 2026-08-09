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

  it('repaints focus while navigating actions with Tab and arrow keys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      confirmDialog({
        data: {
          cancelLabel: 'No',
          confirmLabel: 'Yes',
          defaultOpen: true,
          id: 'update-confirm',
          title: 'Update packages',
        },
        parent: screen,
      });
      const render = vi.spyOn(screen, 'render');

      expect(screen.focused.getContent()).toBe('› [ No ]');

      screen.emit('keypress', undefined, { name: 'tab' });

      expect(screen.focused.getContent()).toBe('› [ Yes ]');
      expect(render).toHaveBeenCalledTimes(1);

      screen.emit('keypress', undefined, { name: 'left' });

      expect(screen.focused.getContent()).toBe('› [ No ]');
      expect(render).toHaveBeenCalledTimes(2);

      screen.emit('keypress', undefined, { name: 'down' });

      expect(screen.focused.getContent()).toBe('› [ Yes ]');
      expect(render).toHaveBeenCalledTimes(3);

      screen.emit('keypress', undefined, { name: 'up' });

      expect(screen.focused.getContent()).toBe('› [ No ]');
      expect(render).toHaveBeenCalledTimes(4);
    } finally {
      screen.destroy();
    }
  });

  it('focuses and repaints a clicked action before keeping the dialog open', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onConfirm = vi.fn();

    try {
      confirmDialog({
        data: {
          cancelLabel: 'No',
          closeOnAction: false,
          confirmLabel: 'Yes',
          defaultOpen: true,
          id: 'update-confirm',
          onConfirm,
          title: 'Update packages',
        },
        parent: screen,
      });
      const cancel = screen.focused;

      screen.emit('keypress', undefined, { name: 'tab' });

      const confirm = screen.focused;
      const render = vi.spyOn(screen, 'render');

      cancel.focus();
      confirm.emit('click');

      expect(onConfirm).toHaveBeenCalledOnce();
      expect(screen.focused).toBe(confirm);
      expect(confirm.getContent()).toBe('› [ Yes ]');
      expect(render).toHaveBeenCalledOnce();
    } finally {
      screen.destroy();
    }
  });

  it('restores previous focus after a clicked action closes the dialog', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const trigger = blessed.button({ content: 'Open', parent: screen });
    const onConfirm = vi.fn();

    try {
      trigger.focus();

      const component = confirmDialog({
        data: {
          confirmLabel: 'Yes',
          defaultOpen: true,
          id: 'update-confirm',
          onConfirm,
          title: 'Update packages',
        },
        parent: screen,
      });

      screen.emit('keypress', undefined, { name: 'right' });
      screen.focused.emit('click');

      expect(onConfirm).toHaveBeenCalledOnce();
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
