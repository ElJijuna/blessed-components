import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { selectionSummary } from '@/adapters/blessed/selection-summary.js';

describe('Blessed SelectionSummary adapter', () => {
  it('navigates, activates, updates, focuses, and destroys its element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onAction = vi.fn();

    try {
      const summary = selectionSummary({
        box: { width: 70 },
        data: {
          actions: [
            { id: 'export', label: 'Export' },
            { disabled: true, id: 'archive', label: 'Archive' },
            { id: 'delete', label: 'Delete' },
          ],
          capabilities: { unicode: false },
          noun: 'row',
          onAction,
          selectedCount: 2,
          totalCount: 10,
          width: 70,
        },
        parent: screen,
      });

      expect(summary.activeActionId()).toBe('export');
      expect(summary.next()).toBe('delete');
      expect(summary.activateActive()?.id).toBe('delete');
      expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'delete' }));
      summary.element.emit('keypress', '', { name: 'home' });
      expect(summary.activeActionId()).toBe('export');
      summary.focus();
      expect(screen.focused).toBe(summary.element);
      summary.setData({
        actions: [{ id: 'remove', label: 'Remove' }],
        selectedCount: 0,
        width: 50,
      });
      expect(summary.activeActionId()).toBeUndefined();
      expect(summary.activateActive()).toBeUndefined();
      expect(summary.element.getContent()).toContain('0 items selected');
      summary.destroy();
      expect(screen.children).not.toContain(summary.element);
    } finally {
      screen.destroy();
    }
  });
});
