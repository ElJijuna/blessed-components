import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { appShell } from '@/adapters/blessed/app-shell.js';

describe('Blessed AppShell adapter', () => {
  it('creates, toggles, updates, and destroys shell regions', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const changes: boolean[] = [];

    try {
      const shell = appShell({
        box: { height: 10, width: 50 },
        data: {
          content: 'Content',
          footerContent: 'Footer',
          gap: 1,
          headerContent: 'Header',
          onSidebarCollapsedChange: (collapsed) => changes.push(collapsed),
          overlayContent: 'Overlay',
          sidebarContent: 'Sidebar',
          sidebarWidth: 12,
        },
        parent: screen,
      });

      expect(shell.header.getContent()).toBe('Header');
      expect(shell.sidebar.getContent()).toBe('Sidebar');
      expect(shell.content.getContent()).toBe('Content');
      expect(shell.footer.getContent()).toBe('Footer');
      expect(shell.sidebar.hidden).toBe(false);
      expect(shell.overlay.hidden).toBe(true);

      expect(shell.toggleSidebar()).toBe(true);
      expect(shell.collapsed()).toBe(true);
      expect(shell.sidebar.hidden).toBe(true);
      expect(changes).toEqual([true]);

      shell.setData({
        content: 'Updated',
        defaultSidebarCollapsed: false,
        headerContent: 'Updated header',
        overlayContent: 'Blocking',
        overlayVisible: true,
        sidebarContent: 'Menu',
      });

      expect(shell.collapsed()).toBe(false);
      expect(shell.header.getContent()).toBe('Updated header');
      expect(shell.content.getContent()).toBe('Updated');
      expect(shell.overlay.hidden).toBe(false);

      shell.destroy();

      expect(screen.children).not.toContain(shell.element);
    } finally {
      screen.destroy();
    }
  });

  it('supports controlled sidebar collapsed state', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const changes: boolean[] = [];

    try {
      const shell = appShell({
        data: {
          onSidebarCollapsedChange: (collapsed) => changes.push(collapsed),
          sidebarCollapsed: false,
        },
        parent: screen,
      });

      expect(shell.toggleSidebar()).toBe(true);
      expect(shell.collapsed()).toBe(false);
      expect(changes).toEqual([true]);
    } finally {
      screen.destroy();
    }
  });
});
