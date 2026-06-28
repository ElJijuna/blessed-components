import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { searchField } from '@/adapters/blessed/search-field.js';

describe('Blessed SearchField adapter', () => {
  it('focuses, updates uncontrolled query, submits, clears, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onClear = vi.fn();
    const onQueryChange = vi.fn();
    const onSubmit = vi.fn();

    try {
      const component = searchField({
        box: { height: 4, width: 24 },
        data: {
          defaultQuery: 'api',
          hint: 'Press Enter',
          label: 'Filter',
          onClear,
          onQueryChange,
          onSubmit,
        },
        parent: screen,
      });

      expect(component.query()).toBe('api');
      expect(component.element.getContent()).toBe('Filter:\n/ api x\n? Press Enter');

      component.focus();
      component.setQuery('worker');
      component.submit();

      expect(component.query()).toBe('worker');
      expect(component.element.getContent()).toBe('Filter:\n› / worker x\n? Press Enter');
      expect(onQueryChange).toHaveBeenCalledWith('worker');
      expect(onSubmit).toHaveBeenCalledWith('worker');

      expect(component.clear()).toBe(true);
      expect(component.query()).toBe('');
      expect(onClear).toHaveBeenCalledTimes(1);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
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
      const component = searchField({
        box: { height: 3, width: 18 },
        data: { label: 'Filter', onQueryChange, query: 'api' },
        parent: screen,
      });

      component.setQuery('worker');

      expect(onQueryChange).toHaveBeenCalledWith('worker');
      expect(component.query()).toBe('api');
      expect(component.element.getContent()).toBe('Filter:\n/ api x');

      component.setData({ label: 'Filter', onQueryChange, query: 'worker' });

      expect(component.query()).toBe('worker');
      expect(component.element.getContent()).toBe('Filter:\n/ worker x');
    } finally {
      screen.destroy();
    }
  });

  it('clears on Escape and blocks interaction while disabled', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onClear = vi.fn();
    const onQueryChange = vi.fn();
    const onSubmit = vi.fn();

    try {
      const component = searchField({
        box: { height: 3, width: 24 },
        data: {
          defaultQuery: 'api',
          label: 'Filter',
          onClear,
          onQueryChange,
          onSubmit,
        },
        parent: screen,
      });

      component.element.emit('keypress', undefined, { name: 'escape' });

      expect(component.query()).toBe('');
      expect(onClear).toHaveBeenCalledTimes(1);

      component.setData({
        disabled: true,
        label: 'Filter',
        onClear,
        onQueryChange,
        onSubmit,
        query: 'locked',
      });

      expect(component.setQuery('open')).toBe(false);
      expect(component.clear()).toBe(false);
      expect(component.submit()).toBe(false);
      expect(screen.keyable).not.toContain(component.element);
      expect(screen.clickable).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
