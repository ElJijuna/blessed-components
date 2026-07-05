import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { sidebarLayout } from '@/adapters/blessed/sidebar-layout.js';

describe('Blessed SidebarLayout adapter', () => {
  it('creates, toggles, updates, and destroys regions', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const changes: boolean[] = [];

    try {
      const component = sidebarLayout({
        box: { height: 8, width: 40 },
        data: {
          gap: 1,
          onCollapsedChange: (collapsed) => changes.push(collapsed),
          sidebarContent: 'Nav',
          sidebarWidth: 12,
          mainContent: 'Content',
        },
        parent: screen,
      });

      expect(component.sidebar.getContent()).toBe('Nav');
      expect(component.main.getContent()).toBe('Content');
      expect(component.sidebar.hidden).toBe(false);
      expect(component.main.left).toBe(13);

      expect(component.toggle()).toBe(true);
      expect(component.collapsed()).toBe(true);
      expect(component.sidebar.hidden).toBe(true);
      expect(component.main.left).toBe(0);
      expect(changes).toEqual([true]);

      component.setData({
        defaultCollapsed: false,
        mainContent: 'Updated',
        sidebarContent: 'Menu',
        sidebarWidth: 10,
      });

      expect(component.collapsed()).toBe(false);
      expect(component.sidebar.getContent()).toBe('Menu');
      expect(component.main.getContent()).toBe('Updated');

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('supports controlled collapsed state', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const changes: boolean[] = [];

    try {
      const component = sidebarLayout({
        data: {
          collapsed: false,
          onCollapsedChange: (collapsed) => changes.push(collapsed),
        },
        parent: screen,
      });

      expect(component.toggle()).toBe(true);
      expect(component.collapsed()).toBe(false);
      expect(changes).toEqual([true]);
    } finally {
      screen.destroy();
    }
  });
});
