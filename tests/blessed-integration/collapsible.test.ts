import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { collapsible } from '@/adapters/blessed/collapsible.js';

describe('Blessed Collapsible adapter', () => {
  it('creates, toggles, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = collapsible({
        box: { height: 5, width: 30 },
        data: {
          bodyHeight: 3,
          content: 'Status: online',
          defaultExpanded: true,
          title: 'Details',
        },
        parent: screen,
      });

      expect(component.header.getContent()).toBe('▾ Details');
      expect(component.body.getContent()).toBe('Status: online');
      expect(component.body.hidden).toBe(false);
      expect(component.body.height).toBe(3);

      expect(component.toggle()).toBe(true);
      expect(component.expanded()).toBe(false);
      expect(component.header.getContent()).toBe('▸ Details');
      expect(component.body.hidden).toBe(true);
      expect(screen.children).toContain(component.element);

      component.setData({
        bodyHeight: 2,
        content: 'Status: offline',
        defaultExpanded: true,
        title: 'State',
      });

      expect(component.header.getContent()).toBe('▾ State');
      expect(component.body.getContent()).toBe('Status: offline');
      expect(component.body.height).toBe(2);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('supports controlled state and disabled interaction', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const changes: boolean[] = [];

    try {
      const component = collapsible({
        box: { height: 4, width: 30 },
        data: {
          bodyHeight: 2,
          expanded: false,
          onExpandedChange: (expanded) => changes.push(expanded),
          title: 'Filters',
        },
        parent: screen,
      });

      expect(component.toggle()).toBe(true);
      expect(changes).toEqual([true]);
      expect(component.expanded()).toBe(false);

      component.setData({
        bodyHeight: 2,
        disabled: true,
        expanded: false,
        onExpandedChange: (expanded) => changes.push(expanded),
        title: 'Filters',
      });

      expect(component.toggle()).toBe(false);
      expect(changes).toEqual([true]);
      expect(component.header.getContent()).toBe('▸ Filters (disabled)');
    } finally {
      screen.destroy();
    }
  });
});
