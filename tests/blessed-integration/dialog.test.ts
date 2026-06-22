import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import {
  dialogBody,
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogRoot,
  dialogTitle,
} from '@/adapters/blessed/dialog.js';

describe('Blessed Dialog adapter', () => {
  it('opens composed modal content, closes it, and restores previous focus', () => {
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
    const onOpenChange = vi.fn();

    try {
      trigger.focus();

      const root = dialogRoot({
        data: {
          defaultOpen: false,
          id: 'deploy-dialog',
          onOpenChange,
        },
        parent: screen,
      });
      const content = dialogContent({
        box: { height: 8, width: 40 },
        parent: root.element,
      });
      const title = dialogTitle({
        data: { content: 'Deploy service' },
        parent: content.element,
      });
      const description = dialogDescription({
        data: { content: 'Production environment' },
        parent: content.element,
      });
      const body = dialogBody({
        data: { content: 'Continue deployment?' },
        parent: content.element,
      });
      const footer = dialogFooter({
        data: { content: 'Enter confirm · Esc cancel' },
        parent: content.element,
      });

      expect(root.isOpen).toBe(false);
      expect(root.element.hidden).toBe(true);

      root.open();

      expect(root.isOpen).toBe(true);
      expect(root.element.hidden).toBe(false);
      expect(title.element.getContent()).toBe('Deploy service');
      expect(description.element.getContent()).toBe('Production environment');
      expect(body.element.getContent()).toContain('Continue deployment?');
      expect(footer.element.getContent()).toBe('Enter confirm · Esc cancel');
      expect(onOpenChange).toHaveBeenCalledWith(true);

      root.close();

      expect(root.isOpen).toBe(false);
      expect(root.element.hidden).toBe(true);
      expect(screen.focused).toBe(trigger);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    } finally {
      screen.destroy();
    }
  });

  it('traps registered focus and closes the top Dialog on Escape', () => {
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

    try {
      trigger.focus();

      const root = dialogRoot({
        data: {
          id: 'confirm-dialog',
          initialFocusId: 'confirm',
        },
        parent: screen,
      });
      const cancel = blessed.button({
        content: 'Cancel',
        height: 1,
        parent: root.element,
        width: 10,
      });
      const confirm = blessed.button({
        content: 'Confirm',
        height: 1,
        parent: root.element,
        width: 10,
      });

      root.registerFocusable('cancel', cancel);
      root.registerFocusable('confirm', confirm);
      root.open();

      expect(screen.focused).toBe(confirm);

      screen.emit('keypress', undefined, { name: 'tab' });
      expect(screen.focused).toBe(cancel);

      screen.emit('keypress', undefined, { name: 'tab', shift: true });
      expect(screen.focused).toBe(confirm);

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(root.isOpen).toBe(false);
      expect(screen.focused).toBe(trigger);
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
      const root = dialogRoot({
        data: {
          id: 'controlled-dialog',
          onOpenChange,
          open: false,
        },
        parent: screen,
      });

      root.open();

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(root.isOpen).toBe(false);
      expect(root.element.hidden).toBe(true);

      root.setData({
        id: 'controlled-dialog',
        onOpenChange,
        open: true,
      });

      expect(root.isOpen).toBe(true);
      expect(root.element.hidden).toBe(false);
    } finally {
      screen.destroy();
    }
  });

  it('lets only the top nested Dialog respond to Escape', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const first = dialogRoot({
        data: { defaultOpen: true, id: 'first-dialog' },
        parent: screen,
      });
      const second = dialogRoot({
        data: { defaultOpen: true, id: 'second-dialog' },
        parent: screen,
      });

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(second.isOpen).toBe(false);
      expect(first.isOpen).toBe(true);

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(first.isOpen).toBe(false);
    } finally {
      screen.destroy();
    }
  });

  it('honors late initial-focus registration and removes its screen listener', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const eventScreen = screen as typeof screen & {
      listeners(type: string): unknown[];
    };
    const listenerCount = eventScreen.listeners('keypress').length;
    const root = dialogRoot({
      data: {
        defaultOpen: true,
        id: 'late-focus-dialog',
        initialFocusId: 'confirm',
      },
      parent: screen,
    });
    const cancel = blessed.button({
      content: 'Cancel',
      height: 1,
      parent: root.element,
      width: 10,
    });
    const confirm = blessed.button({
      content: 'Confirm',
      height: 1,
      parent: root.element,
      width: 10,
    });

    root.registerFocusable('cancel', cancel);
    expect(screen.focused).toBe(root.element);

    root.registerFocusable('confirm', confirm);
    expect(screen.focused).toBe(confirm);
    expect(eventScreen.listeners('keypress')).toHaveLength(listenerCount + 1);

    root.destroy();

    expect(eventScreen.listeners('keypress')).toHaveLength(listenerCount);
    screen.destroy();
  });
});
