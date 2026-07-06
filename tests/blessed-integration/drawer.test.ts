import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import {
  drawerBody,
  drawerContent,
  drawerFooter,
  drawerHeader,
  drawerRoot,
} from '@/adapters/blessed/drawer.js';

describe('Blessed Drawer adapter', () => {
  it('opens edge content, closes it, and restores previous focus', () => {
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

      const root = drawerRoot({
        data: {
          defaultOpen: false,
          id: 'settings-drawer',
          onOpenChange,
        },
        parent: screen,
      });
      const content = drawerContent({
        box: { height: 8, width: 32 },
        data: { edge: 'right' },
        parent: root.element,
      });
      const header = drawerHeader({
        data: { content: 'Settings' },
        parent: content.element,
      });
      const body = drawerBody({
        data: { content: 'Runtime configuration' },
        parent: content.element,
      });
      const footer = drawerFooter({
        data: { content: 'Esc close' },
        parent: content.element,
      });

      expect(root.isOpen).toBe(false);
      expect(root.element.hidden).toBe(true);

      root.open();

      expect(root.isOpen).toBe(true);
      expect(root.element.hidden).toBe(false);
      expect(content.element.right).toBe(0);
      expect(content.element.width).toBe(32);
      expect(header.element.getContent()).toBe('Settings');
      expect(body.element.getContent()).toContain('Runtime configuration');
      expect(footer.element.getContent()).toBe('Esc close');
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

  it('traps registered focus and closes the top Drawer on Escape', () => {
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

      const root = drawerRoot({
        data: {
          id: 'filters-drawer',
          initialFocusId: 'apply',
        },
        parent: screen,
      });
      const cancel = blessed.button({
        content: 'Cancel',
        height: 1,
        parent: root.element,
        width: 10,
      });
      const apply = blessed.button({
        content: 'Apply',
        height: 1,
        parent: root.element,
        width: 10,
      });

      root.registerFocusable('cancel', cancel);
      root.registerFocusable('apply', apply);
      root.open();

      expect(screen.focused).toBe(apply);

      screen.emit('keypress', undefined, { name: 'tab' });
      expect(screen.focused).toBe(cancel);

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(root.isOpen).toBe(false);
      expect(screen.focused).toBe(trigger);
    } finally {
      screen.destroy();
    }
  });

  it('updates content edge and keeps controlled visibility until data changes', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOpenChange = vi.fn();

    try {
      const root = drawerRoot({
        data: {
          id: 'controlled-drawer',
          onOpenChange,
          open: false,
        },
        parent: screen,
      });
      const content = drawerContent({
        data: { edge: 'left', size: 20 },
        parent: root.element,
      });

      root.open();

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(root.isOpen).toBe(false);
      expect(root.element.hidden).toBe(true);

      root.setData({
        id: 'controlled-drawer',
        onOpenChange,
        open: true,
      });
      content.setData({ edge: 'bottom', size: 6 });

      expect(root.isOpen).toBe(true);
      expect(root.element.hidden).toBe(false);
      expect(content.element.bottom).toBe(0);
      expect(content.element.height).toBe(6);
    } finally {
      screen.destroy();
    }
  });
});
