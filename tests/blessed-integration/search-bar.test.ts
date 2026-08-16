import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { searchBar } from '@/adapters/blessed/search-bar.js';

describe('Blessed SearchBar adapter', () => {
  it('navigates scopes, updates query, submits, clears, focuses, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onClear = vi.fn();
    const onQueryChange = vi.fn();
    const onScopeChange = vi.fn();
    const onSubmit = vi.fn();

    try {
      const component = searchBar({
        box: { width: 80 },
        data: {
          capabilities: { colorLevel: 0, unicode: false },
          defaultQuery: 'api',
          onClear,
          onQueryChange,
          onScopeChange,
          onSubmit,
          resultCount: 2,
          scopes: [
            { id: 'all', label: 'All' },
            { id: 'code', label: 'Code' },
          ],
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('[All] | >/ api< | 2 results | x | Search');
      component.focusTarget('scope');
      component.element.emit('keypress', undefined, { name: 'down' });
      expect(component.activeScope()?.id).toBe('code');
      expect(onScopeChange).toHaveBeenCalledWith('code');

      component.focus();
      component.element.emit('submit', 'worker');
      expect(component.query()).toBe('worker');
      expect(onQueryChange).toHaveBeenCalledWith('worker');
      expect(onSubmit).toHaveBeenCalledWith({
        query: 'worker',
        scope: { id: 'code', label: 'Code' },
      });

      component.focusTarget('clear');
      component.activateActive();
      expect(component.query()).toBe('');
      expect(onClear).toHaveBeenCalledOnce();
      expect(component.activeTarget()).toBe('query');

      component.focus();
      expect(screen.focused).toBe(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('updates controlled data and removes disabled interaction', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onQueryChange = vi.fn();

    try {
      const component = searchBar({
        box: { width: 50 },
        data: {
          capabilities: { colorLevel: 0, unicode: false },
          onQueryChange,
          query: 'api',
          scopes: [{ id: 'all', label: 'All' }],
        },
        parent: screen,
      });

      component.setQuery('worker');
      expect(component.query()).toBe('api');
      expect(onQueryChange).toHaveBeenCalledWith('worker');

      component.setData({
        capabilities: { colorLevel: 0, unicode: false },
        disabled: true,
        onQueryChange,
        query: 'locked',
        scopes: [{ id: 'all', label: 'All' }],
      });

      expect(component.query()).toBe('locked');
      expect(component.setQuery('open')).toBe(false);
      expect(component.submit()).toBe(false);
      expect(screen.keyable).not.toContain(component.element);
      expect(screen.clickable).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps the composed bar visible and activates controls through real keypresses', async () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onClear = vi.fn();
    const onSubmit = vi.fn();

    try {
      const component = searchBar({
        box: { width: 60 },
        data: {
          capabilities: { colorLevel: 0, unicode: false },
          defaultQuery: 'api',
          onClear,
          onSubmit,
          resultCount: 2,
        },
        parent: screen,
      });

      component.focus();
      await new Promise<void>((resolve) => setImmediate(resolve));
      component.element.emit('keypress', 'x', { full: 'x', name: 'x' });

      expect(component.query()).toBe('apix');
      expect(component.element.getContent()).toContain('2 results | x | Search');

      component.element.emit('keypress', undefined, { full: 'left', name: 'left' });
      component.element.emit('keypress', 'z', { full: 'z', name: 'z' });
      expect(component.query()).toBe('apizx');

      component.element.emit('keypress', '\t', { full: 'tab', name: 'tab' });
      component.element.emit('keypress', '\t', { full: 'tab', name: 'tab' });
      expect(component.activeTarget()).toBe('submit');
      expect(component.query()).toBe('apizx');

      component.element.emit('keypress', '\r', { full: 'enter', name: 'enter' });
      expect(onSubmit).toHaveBeenCalledWith({ query: 'apizx' });
      expect(component.activeTarget()).toBe('submit');

      component.element.emit('keypress', undefined, {
        full: 'shift-tab',
        name: 'tab',
        shift: true,
      });
      component.element.emit('keypress', '\r', { full: 'enter', name: 'enter' });
      expect(component.query()).toBe('');
      expect(onClear).toHaveBeenCalledOnce();
    } finally {
      screen.destroy();
    }
  });
});
