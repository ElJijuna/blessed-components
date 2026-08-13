import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';
import { commandInput } from '@/adapters/blessed/command-input.js';

describe('Blessed CommandInput adapter', () => {
  it('edits, suggests, navigates history, submits, cancels, updates, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    try {
      const input = commandInput({
        box: { height: 5, width: 60 },
        data: {
          history: ['status', 'logs'],
          onCancel,
          onSubmit,
          suggestions: [{ id: 'deploy', value: 'deploy production' }],
        },
        parent: screen,
      });

      input.setValue('dep');
      expect(input.useActiveSuggestion()).toBe('deploy production');
      expect(input.submit()).toBe(true);
      expect(onSubmit).toHaveBeenCalledWith('deploy production');
      expect(input.historyPrevious()).toBe('logs');
      expect(input.historyPrevious()).toBe('status');
      input.cancel();
      expect(onCancel).toHaveBeenCalledOnce();
      input.focus();
      expect(screen.focused).toBe(input.element);
      input.setData({ status: 'running', value: 'deploy production' });
      expect(input.submit()).toBe(false);
      input.destroy();
      expect(screen.children).not.toContain(input.element);
    } finally {
      screen.destroy();
    }
  });
});
