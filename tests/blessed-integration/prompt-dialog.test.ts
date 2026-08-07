import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { promptDialog } from '@/adapters/blessed/prompt-dialog.js';

describe('Blessed PromptDialog adapter', () => {
  it('opens with input focus, edits, traps Tab, submits, and restores focus', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const trigger = blessed.button({ content: 'Rename', parent: screen });
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();

    try {
      trigger.focus();

      const component = promptDialog({
        data: {
          defaultOpen: false,
          defaultValue: 'main',
          hint: 'Use lowercase letters',
          id: 'rename-branch',
          message: 'Branch name',
          onOpenChange,
          onSubmit,
          onValueChange,
          submitLabel: 'Rename',
          title: 'Rename branch',
        },
        parent: screen,
      });

      component.open();

      expect(component.isOpen).toBe(true);
      expect(screen.focused.getContent()).toContain('› main');

      component.setValue('release/next');
      screen.emit('keypress', undefined, { name: 'tab' });

      expect(screen.focused.getContent()).toBe('› [ Rename ]');
      expect(component.value()).toBe('release/next');
      expect(onValueChange).toHaveBeenCalledWith('release/next');

      component.submit();

      expect(onSubmit).toHaveBeenCalledWith('release/next');
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
      expect(component.isOpen).toBe(false);
      expect(screen.focused).toBe(trigger);
    } finally {
      screen.destroy();
    }
  });

  it('treats Escape as cancel only while topmost', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onCancel = vi.fn();

    try {
      const component = promptDialog({
        data: {
          defaultOpen: true,
          id: 'new-environment',
          message: 'Environment name',
          onCancel,
          title: 'Create environment',
        },
        parent: screen,
      });

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(onCancel).toHaveBeenCalledOnce();
      expect(component.isOpen).toBe(false);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled value and visibility unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = promptDialog({
        data: {
          id: 'controlled-prompt',
          message: 'Name',
          onOpenChange,
          onValueChange,
          open: false,
          title: 'Rename',
          value: 'main',
        },
        parent: screen,
      });

      component.open();
      component.setValue('next');

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onValueChange).toHaveBeenCalledWith('next');
      expect(component.isOpen).toBe(false);
      expect(component.value()).toBe('main');

      component.setData({
        id: 'controlled-prompt',
        message: 'Name',
        onOpenChange,
        onValueChange,
        open: true,
        title: 'Rename',
        value: 'next',
      });

      expect(component.isOpen).toBe(true);
      expect(component.value()).toBe('next');
    } finally {
      screen.destroy();
    }
  });

  it('blocks disabled input and submission while leaving cancellation available', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onCancel = vi.fn();
    const onSubmit = vi.fn();

    try {
      const component = promptDialog({
        data: {
          defaultOpen: true,
          defaultValue: 'locked',
          id: 'disabled-prompt',
          inputDisabled: true,
          message: 'Name',
          onCancel,
          onSubmit,
          submitDisabled: true,
          title: 'Locked prompt',
        },
        parent: screen,
      });

      expect(component.setValue('changed')).toBe(false);
      expect(component.clear()).toBe(false);
      expect(component.submit()).toBe(false);
      expect(component.cancel()).toBe(true);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalledOnce();
    } finally {
      screen.destroy();
    }
  });

  it('releases input capture and screen listeners when destroyed while open', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const eventScreen = screen as typeof screen & {
      listeners(type: string): unknown[];
    };
    const listenerCount = eventScreen.listeners('keypress').length;

    try {
      const component = promptDialog({
        data: {
          defaultOpen: true,
          id: 'destroyed-prompt',
          message: 'Name',
          title: 'Temporary prompt',
        },
        parent: screen,
      });

      expect(screen.grabKeys).toBe(true);
      expect(eventScreen.listeners('keypress')).toHaveLength(listenerCount + 2);

      component.destroy();

      expect(screen.grabKeys).toBe(false);
      expect(eventScreen.listeners('keypress')).toHaveLength(listenerCount);
    } finally {
      screen.destroy();
    }
  });
});
