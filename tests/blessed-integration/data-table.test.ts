import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { dataTable } from '@/adapters/blessed/data-table.js';
import type { DataTableColumn } from '@/components/collections/data-table/index.js';

interface Row {
  cpu: string;
  disabled?: boolean;
  id: string;
  service: string;
}

const serviceColumn: DataTableColumn<Row> = { header: 'Service', id: 'service', sortable: true };
const cpuColumn: DataTableColumn<Row> = {
  align: 'right',
  header: 'CPU',
  id: 'cpu',
  sortable: true,
  width: 5,
};
const columns: DataTableColumn<Row>[] = [serviceColumn, cpuColumn];

function createScreen(): blessed.Widgets.Screen {
  return blessed.screen({
    input: new PassThrough(),
    output: new PassThrough(),
    terminal: 'xterm-256color',
  });
}

describe('Blessed DataTable adapter', () => {
  it('navigates enabled rows and selects the active row', () => {
    const screen = createScreen();
    const onValueChange = vi.fn();

    try {
      const component = dataTable({
        box: { height: 5, width: 24 },
        data: {
          columns,
          defaultValue: 'one',
          onValueChange,
          rows: [
            { cpu: '1%', id: 'one', service: 'One' },
            { cpu: '2%', disabled: true, id: 'two', service: 'Two' },
            { cpu: '3%', id: 'three', service: 'Three' },
          ],
        },
        parent: screen,
      });

      expect(component.activeId()).toBe('one');

      component.element.emit('keypress', undefined, { name: 'down' });
      component.element.emit('keypress', undefined, { name: 'enter' });

      expect(component.activeId()).toBe('three');
      expect(component.value()).toBe('three');
      expect(onValueChange).toHaveBeenCalledWith('three');

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('filters rows through setQuery and resets to page 1', () => {
    const screen = createScreen();
    const onQueryChange = vi.fn();

    try {
      const component = dataTable({
        box: { height: 6, width: 24 },
        data: {
          columns,
          onQueryChange,
          pageSize: 2,
          rows: [
            { cpu: '1%', id: 'api', service: 'API' },
            { cpu: '2%', id: 'worker', service: 'Worker' },
            { cpu: '3%', id: 'cache', service: 'Cache' },
          ],
        },
        parent: screen,
      });

      component.setPage(2);
      expect(component.page().page).toBe(2);

      component.setQuery('ca');

      expect(onQueryChange).toHaveBeenCalledWith('ca');
      expect(component.query()).toBe('ca');
      expect(component.page()).toEqual({ page: 1, pageCount: 1 });
      expect(component.element.getContent()).toContain('Cache');
      expect(component.element.getContent()).not.toContain('API');
    } finally {
      screen.destroy();
    }
  });

  it('toggles sort through ascending, descending, and cleared, ignoring non-sortable columns', () => {
    const screen = createScreen();
    const onSortChange = vi.fn();

    try {
      const component = dataTable({
        box: { height: 6, width: 24 },
        data: {
          columns: [{ header: 'Service', id: 'service' }, cpuColumn],
          onSortChange,
          rows: [
            { cpu: '1%', id: 'api', service: 'API' },
            { cpu: '2%', id: 'worker', service: 'Worker' },
          ],
        },
        parent: screen,
      });

      expect(component.toggleSort('service')).toBeUndefined();
      expect(onSortChange).not.toHaveBeenCalled();

      component.toggleSort('cpu');
      expect(component.sort()).toEqual({ columnId: 'cpu', direction: 'asc' });

      component.toggleSort('cpu');
      expect(component.sort()).toEqual({ columnId: 'cpu', direction: 'desc' });

      component.toggleSort('cpu');
      expect(component.sort()).toBeUndefined();
      expect(onSortChange).toHaveBeenCalledTimes(3);
    } finally {
      screen.destroy();
    }
  });

  it('moves between pages with setPage, nextPage, previousPage, and PageDown/PageUp', () => {
    const screen = createScreen();
    const onPageChange = vi.fn();

    try {
      const component = dataTable({
        box: { height: 6, width: 24 },
        data: {
          columns,
          onPageChange,
          pageSize: 1,
          rows: [
            { cpu: '1%', id: 'api', service: 'API' },
            { cpu: '2%', id: 'worker', service: 'Worker' },
            { cpu: '3%', id: 'cache', service: 'Cache' },
          ],
        },
        parent: screen,
      });

      expect(component.page()).toEqual({ page: 1, pageCount: 3 });

      component.element.emit('keypress', undefined, { name: 'pagedown' });
      expect(component.page().page).toBe(2);
      expect(component.activeId()).toBe('worker');

      component.nextPage();
      expect(component.page().page).toBe(3);

      component.element.emit('keypress', undefined, { name: 'pageup' });
      expect(component.page().page).toBe(2);

      expect(component.previousPage()).toBe(1);
      expect(onPageChange).toHaveBeenCalledWith(1);
    } finally {
      screen.destroy();
    }
  });

  it('hides columns through setHiddenColumnIds and refuses to hide every column', () => {
    const screen = createScreen();
    const onHiddenColumnIdsChange = vi.fn();

    try {
      const component = dataTable({
        box: { height: 5, width: 24 },
        data: {
          columns,
          onHiddenColumnIdsChange,
          rows: [{ cpu: '1%', id: 'api', service: 'API' }],
        },
        parent: screen,
      });

      component.setHiddenColumnIds(['cpu']);

      expect(component.hiddenColumnIds()).toEqual(['cpu']);
      expect(onHiddenColumnIdsChange).toHaveBeenCalledWith(['cpu']);
      expect(component.element.getContent()).not.toContain('CPU');

      const rejected = component.setHiddenColumnIds(['service', 'cpu']);

      expect(rejected).toEqual(['cpu']);
      expect(component.hiddenColumnIds()).toEqual(['cpu']);
    } finally {
      screen.destroy();
    }
  });

  it('destroys without leaking listeners', () => {
    const screen = createScreen();

    try {
      const component = dataTable({
        box: { height: 4, width: 20 },
        data: { columns, rows: [{ cpu: '1%', id: 'api', service: 'API' }] },
        parent: screen,
      });

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
