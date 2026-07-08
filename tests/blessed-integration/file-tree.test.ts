import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { fileTree } from '@/adapters/blessed/file-tree.js';

describe('Blessed FileTree adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = fileTree({
        box: { height: 2, width: 30 },
        data: { nodes: [{ id: 'README.md', kind: 'file', label: 'README.md' }] },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('      f   README.md');
      component.setData({ nodes: [{ id: 'src', kind: 'directory', label: 'src' }] });
      expect(component.element.getContent()).toBe('      d   src');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
