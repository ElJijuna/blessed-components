import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { tree } from '@/adapters/blessed/tree.js';

describe('Blessed Tree adapter', () => {
  const nodes = [
    {
      children: [
        { id: 'src/index', label: 'index.ts' },
        { disabled: true, id: 'src/generated', label: 'generated.ts' },
        { id: 'src/tree', label: 'tree.ts' },
      ],
      id: 'src',
      label: 'src',
    },
    { id: 'README', label: 'README.md' },
  ] as const;

  it('expands branches, navigates enabled visible nodes, and selects the active node', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onExpandedIdsChange = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = tree({
        box: { height: 4, width: 24 },
        data: {
          nodes,
          onExpandedIdsChange,
          onValueChange,
        },
        parent: screen,
      });

      expect(component.activeId()).toBe('src');
      expect(component.element.getContent()).toContain('▸ src');

      component.element.emit('keypress', undefined, { name: 'right' });
      component.element.emit('keypress', undefined, { name: 'down' });
      component.element.emit('keypress', undefined, { name: 'down' });
      component.element.emit('keypress', undefined, { name: 'enter' });

      expect(component.expandedIds()).toEqual(['src']);
      expect(onExpandedIdsChange).toHaveBeenCalledWith(['src']);
      expect(component.activeId()).toBe('src/tree');
      expect(component.value()).toBe('src/tree');
      expect(onValueChange).toHaveBeenCalledWith('src/tree');
      expect(component.element.getContent()).toContain('› ●   tree.ts');

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled expansion and selection unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onExpandedIdsChange = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = tree({
        box: { height: 4, width: 24 },
        data: {
          expandedIds: [],
          nodes,
          onExpandedIdsChange,
          onValueChange,
          value: 'README',
        },
        parent: screen,
      });

      component.expand('src');
      component.focusItem('README');
      component.selectActive();

      expect(onExpandedIdsChange).toHaveBeenCalledWith(['src']);
      expect(component.expandedIds()).toEqual([]);
      expect(onValueChange).toHaveBeenCalledWith('README');
      expect(component.value()).toBe('README');

      component.setData({
        expandedIds: ['src'],
        nodes,
        onExpandedIdsChange,
        onValueChange,
        value: 'src/index',
      });

      expect(component.expandedIds()).toEqual(['src']);
      expect(component.value()).toBe('src/index');
      expect(component.element.getContent()).toContain('●   index.ts');
    } finally {
      screen.destroy();
    }
  });

  it('supports mouse click toggle and wheel movement', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = tree({
        box: { height: 4, width: 24 },
        data: { nodes },
        parent: screen,
      });

      expect(screen.clickable).toContain(component.element);

      component.element.emit('click', { y: 0 });
      expect(component.expandedIds()).toEqual(['src']);

      component.element.emit('wheeldown');
      expect(component.activeId()).toBe('src/index');

      component.element.emit('wheelup');
      expect(component.activeId()).toBe('src');
    } finally {
      screen.destroy();
    }
  });
});
