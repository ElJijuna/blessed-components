import blessed from 'blessed';
import {
  calculateDashboardGridLayout,
  type DashboardGridBreakpoint,
  type DashboardGridItem,
} from '@/components/layout/dashboard-grid/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';
export type DashboardGridBoxOptions = BoxElementOptions;
export type DashboardGridSlotOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export interface DashboardGridData extends BoxData {
  breakpoints?: readonly DashboardGridBreakpoint[];
  columnGap?: number;
  items: readonly DashboardGridItem[];
  rowGap?: number;
  rowHeight?: number;
}
export interface DashboardGridOptions {
  box?: DashboardGridBoxOptions;
  data: DashboardGridData;
  parent: blessed.Widgets.Node;
  slots?: Record<string, DashboardGridSlotOptions>;
}
export interface DashboardGridHandle
  extends BlessedComponentHandle<DashboardGridData, blessed.Widgets.BoxElement> {
  columns(): number;
  contentHeight(): number;
  layout(): void;
  slot(id: string): blessed.Widgets.BoxElement | undefined;
  readonly slots: ReadonlyMap<string, blessed.Widgets.BoxElement>;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a responsive DashboardGrid with stable caller-composable slots. */
export function dashboardGrid({
  box,
  data: initialData,
  parent,
  slots: slotOptions = {},
}: DashboardGridOptions): DashboardGridHandle {
  let data = initialData;
  let resolvedColumns = 1;
  let resolvedContentHeight = 0;

  const element = blessed.box({
    ...box,
    content: '',
    parent,
    style: { ...box?.style, border: { ...box?.style?.border } },
    tags: false,
  });
  const slotMap = new Map<string, blessed.Widgets.BoxElement>();
  const style = createBoxStyleController(element, box, {}, { component: 'dashboard-grid' });
  const syncSlots = () => {
    const wanted = new Set(data.items.map(({ id }) => id));

    for (const [id, slot] of slotMap) {
      if (!wanted.has(id)) {
        slot.destroy();
        slotMap.delete(id);
      }
    }

    for (const { id } of data.items) {
      if (!slotMap.has(id)) {
        slotMap.set(
          id,
          blessed.box({ ...slotOptions[id], content: '', parent: element, tags: false }),
        );
      }
    }
  };
  const layout = () => {
    syncSlots();
    const result = calculateDashboardGridLayout({
      ...(data.breakpoints === undefined ? {} : { breakpoints: data.breakpoints }),
      ...(data.columnGap === undefined ? {} : { columnGap: data.columnGap }),
      height: Math.max(0, dimension(element.height) - dimension(element.iheight)),
      items: data.items,
      ...(data.rowGap === undefined ? {} : { rowGap: data.rowGap }),
      ...(data.rowHeight === undefined ? {} : { rowHeight: data.rowHeight }),
      width: Math.max(0, dimension(element.width) - dimension(element.iwidth)),
    });

    resolvedColumns = result.columns;
    resolvedContentHeight = result.contentHeight;

    for (const region of result.items) {
      const slot = slotMap.get(region.id);

      if (slot) {
        slot.left = region.x;
        slot.top = region.y;
        slot.width = region.width;
        slot.height = region.height;
      }
    }
  };
  const render = () => {
    style.apply(data);
    layout();
  };

  render();
  element.on('resize', layout);

  return {
    columns: () => resolvedColumns,
    contentHeight: () => resolvedContentHeight,
    destroy: () => element.destroy(),
    element,
    layout,
    setData(nextData) {
      data = nextData;
      render();
    },
    slot: (id) => slotMap.get(id),
    slots: slotMap,
  };
}
