import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';
import { workspaceSwitcher } from '@/adapters/blessed/workspace-switcher.js';

describe('Blessed WorkspaceSwitcher adapter', () => {
  it('searches, navigates, selects, updates, focuses, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onValueChange = vi.fn();

    try {
      const switcher = workspaceSwitcher({
        box: { height: 6, width: 50 },
        data: {
          capabilities: { unicode: false },
          defaultValue: 'payments',
          items: [
            { id: 'payments', label: 'Payments' },
            { disabled: true, id: 'archive', label: 'Archive' },
            { id: 'search', label: 'Search' },
          ],
          onValueChange,
        },
        parent: screen,
      });

      expect(switcher.value()).toBe('payments');
      expect(switcher.next()).toBe('search');
      expect(switcher.selectActive()).toBe('search');
      expect(onValueChange).toHaveBeenCalledWith('search');
      switcher.setQuery('pay');
      expect(switcher.activeId()).toBe('payments');
      switcher.clearQuery();
      switcher.focus();
      expect(screen.focused).toBe(switcher.element);
      switcher.setData({ items: [{ id: 'core', label: 'Core' }] });
      expect(switcher.activeId()).toBe('core');
      switcher.destroy();
      expect(screen.children).not.toContain(switcher.element);
    } finally {
      screen.destroy();
    }
  });
});
