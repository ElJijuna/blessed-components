import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { terminalPane } from '@/adapters/blessed/terminal-pane.js';

describe('Blessed TerminalPane adapter', () => {
  it('appends, updates status, clears, and reports changes', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onLinesChange = vi.fn();

    try {
      const pane = terminalPane({
        box: { height: 4, width: 30 },
        data: {
          command: { args: ['run', 'test'], command: 'npm' },
          onLinesChange,
          status: 'running',
        },
        parent: screen,
      });

      pane.append({ stream: 'stdout', text: 'one' });
      pane.appendMany([
        { stream: 'stderr', text: 'two' },
        { stream: 'system', text: 'three' },
      ]);

      expect(pane.lines()).toEqual([
        { stream: 'stdout', text: 'one' },
        { stream: 'stderr', text: 'two' },
        { stream: 'system', text: 'three' },
      ]);
      expect(pane.element.getContent()).toBe(
        '$ npm run test [running]\nout │ one\nerr │ two\nsys │ three',
      );
      expect(onLinesChange).toHaveBeenLastCalledWith([
        { stream: 'stdout', text: 'one' },
        { stream: 'stderr', text: 'two' },
        { stream: 'system', text: 'three' },
      ]);

      pane.setStatus('succeeded', 0);

      expect(pane.element.getContent()).toContain('[succeeded 0]');

      pane.clear();

      expect(pane.lines()).toEqual([]);
      expect(pane.element.getContent()).toBe('$ npm run test [succeeded 0]\nNo terminal output');
    } finally {
      screen.destroy();
    }
  });

  it('supports keyboard scrolling when follow is disabled', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOffsetChange = vi.fn();

    try {
      const pane = terminalPane({
        box: { height: 2, width: 18 },
        data: {
          follow: false,
          lines: [{ text: 'one' }, { text: 'two' }, { text: 'three' }],
          onOffsetChange,
          showHeader: false,
        },
        parent: screen,
      });

      pane.element.emit('keypress', undefined, { name: 'down' });

      expect(pane.element.getContent()).toBe('out │ two\nout │ three');
      expect(onOffsetChange).toHaveBeenCalledWith(1);

      pane.element.emit('keypress', undefined, { name: 'home' });

      expect(pane.element.getContent()).toBe('out │ one\nout │ two');
    } finally {
      screen.destroy();
    }
  });
});
