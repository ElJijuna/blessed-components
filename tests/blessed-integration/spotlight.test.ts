import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { spotlight } from '@/adapters/blessed/spotlight.js';

describe('Blessed Spotlight adapter', () => {
  it('opens, filters results, activates a result, closes, and restores focus', () => {
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
    const onAction = vi.fn();
    const onOpenChange = vi.fn();
    const onQueryChange = vi.fn();

    try {
      trigger.focus();

      const component = spotlight({
        content: { height: 10, width: 48 },
        data: {
          defaultOpen: false,
          id: 'command-spotlight',
          items: [
            { id: 'build', label: 'Build package', shortcut: 'b' },
            { id: 'deploy', keywords: ['release'], label: 'Deploy service', shortcut: 'd' },
            { id: 'logs', label: 'Open logs', shortcut: 'l' },
          ],
          onAction,
          onOpenChange,
          onQueryChange,
        },
        parent: screen,
      });

      expect(component.isOpen).toBe(false);
      expect(component.element.hidden).toBe(true);

      component.open();
      component.setQuery('rel');

      expect(component.isOpen).toBe(true);
      expect(component.element.hidden).toBe(false);
      expect(component.query()).toBe('rel');
      expect(component.results().map(({ id }) => id)).toEqual(['deploy']);
      expect(onQueryChange).toHaveBeenCalledWith('rel');

      const activated = component.activateActive();

      expect(activated?.id).toBe('deploy');
      expect(onAction).toHaveBeenCalledWith({
        id: 'deploy',
        keywords: ['release'],
        label: 'Deploy service',
        shortcut: 'd',
      });
      expect(component.isOpen).toBe(false);
      expect(screen.focused).toBe(trigger);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled query unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onQueryChange = vi.fn();

    try {
      const component = spotlight({
        content: { height: 8, width: 42 },
        data: {
          id: 'controlled-spotlight',
          items: [
            { id: 'build', label: 'Build' },
            { id: 'deploy', label: 'Deploy' },
          ],
          onQueryChange,
          open: true,
          query: '',
        },
        parent: screen,
      });

      component.setQuery('deploy');

      expect(component.query()).toBe('');
      expect(component.results().map(({ id }) => id)).toEqual(['build', 'deploy']);
      expect(onQueryChange).toHaveBeenCalledWith('deploy');

      component.setData({
        id: 'controlled-spotlight',
        items: [
          { id: 'build', label: 'Build' },
          { id: 'deploy', label: 'Deploy' },
        ],
        onQueryChange,
        open: true,
        query: 'deploy',
      });

      expect(component.query()).toBe('deploy');
      expect(component.results().map(({ id }) => id)).toEqual(['deploy']);
    } finally {
      screen.destroy();
    }
  });

  it('closes only the top Spotlight on Escape and destroys owned nodes', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const first = spotlight({
        data: {
          defaultOpen: true,
          id: 'first-spotlight',
          items: [{ id: 'build', label: 'Build' }],
        },
        parent: screen,
      });
      const second = spotlight({
        data: {
          defaultOpen: true,
          id: 'second-spotlight',
          items: [{ id: 'deploy', label: 'Deploy' }],
        },
        parent: screen,
      });

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(second.isOpen).toBe(false);
      expect(first.isOpen).toBe(true);

      second.destroy();
      first.destroy();

      expect(screen.children).not.toContain(second.element);
      expect(screen.children).not.toContain(first.element);
    } finally {
      screen.destroy();
    }
  });
});
