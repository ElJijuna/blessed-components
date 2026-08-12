import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { filterBar } from '@/adapters/blessed/filter-bar.js';

describe('Blessed FilterBar adapter', () => {
  it('navigates, activates callbacks, updates, focuses, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onRemoveFilter = vi.fn();
    const onClear = vi.fn();
    const onReset = vi.fn();

    try {
      const bar = filterBar({
        box: { mouse: false, width: 80 },
        data: {
          capabilities: { unicode: false },
          filters: [{ id: 'status', label: 'Status', value: 'open' }],
          onClear,
          onRemoveFilter,
          onReset,
          query: 'bug',
          showReset: true,
          width: 80,
        },
        parent: screen,
      });

      expect(bar.activeTarget()).toBe('filter:status');
      bar.activateActive();
      expect(onRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ id: 'status' }));
      expect(bar.next()).toBe('clear');
      bar.activateActive();
      expect(onClear).toHaveBeenCalledOnce();
      expect(bar.next()).toBe('reset');
      bar.element.emit('keypress', '', { name: 'enter' });
      expect(onReset).toHaveBeenCalledOnce();
      bar.focus();
      expect(screen.focused).toBe(bar.element);
      bar.setData({ capabilities: { unicode: true }, resultCount: 4, width: 30 });
      expect(bar.activeTarget()).toBeUndefined();
      expect(bar.element.getContent()).toContain('4 results');
      bar.destroy();
      expect(screen.children).not.toContain(bar.element);
    } finally {
      screen.destroy();
    }
  });
});
