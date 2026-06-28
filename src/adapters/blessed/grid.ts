import blessed from 'blessed';

import { calculateGridLayout, type GridItemPlacement } from '@/components/layout/grid/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Grid adapter. */
export type GridBoxOptions = BoxElementOptions;

/** Stateful layout and theme data accepted by {@link grid}. */
export interface GridData extends BoxData {
  /** Empty cells between adjacent columns. Overrides `gap` horizontally. */
  columnGap?: number;

  /** Number of columns in the grid. */
  columns: number;

  /** Shared empty cells/rows between adjacent tracks. @defaultValue `0` */
  gap?: number;

  /** Per-child placements in direct child order. Missing entries auto-place. */
  items?: readonly GridItemPlacement[];

  /** Empty rows between adjacent rows. Overrides `gap` vertically. */
  rowGap?: number;

  /** Number of rows in the grid. Inferred from items when omitted. */
  rows?: number;
}

/** Options accepted by the Blessed {@link grid} adapter. */
export interface GridOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: GridBoxOptions;

  /** Track count, gaps, placements, and semantic theme data. */
  data: GridData;

  /** Blessed screen or node receiving the Grid container. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link grid}. */
export interface GridHandle extends BlessedComponentHandle<GridData, blessed.Widgets.BoxElement> {
  /** Recalculates positions for current direct children. */
  layout(): void;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function isElement(node: blessed.Widgets.Node): node is blessed.Widgets.BlessedElement {
  return 'position' in node;
}

/** Creates a themed container that lays out its direct Blessed children in a grid. */
export function grid({ box: elementOptions, data: initialData, parent }: GridOptions): GridHandle {
  let data = initialData;

  const element = blessed.box({
    ...elementOptions,
    content: '',
    parent,
    style: {
      ...elementOptions?.style,
      border: { ...elementOptions?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, elementOptions);
  const layout = (): void => {
    const children = element.children.filter(isElement);
    const width = Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
    const height = Math.max(
      0,
      numericDimension(element.height) - numericDimension(element.iheight),
    );
    const positions = calculateGridLayout({
      ...(data.columnGap === undefined ? {} : { columnGap: data.columnGap }),
      columns: data.columns,
      ...(data.gap === undefined ? {} : { gap: data.gap }),
      height,
      items: children.map((_, index) => data.items?.[index] ?? {}),
      ...(data.rowGap === undefined ? {} : { rowGap: data.rowGap }),
      ...(data.rows === undefined ? {} : { rows: data.rows }),
      width,
    });

    for (const [index, child] of children.entries()) {
      const position = positions[index];

      if (position === undefined) {
        continue;
      }

      child.left = position.x;
      child.top = position.y;
      child.width = position.width;
      child.height = position.height;
    }
  };
  const render = (): void => {
    style.apply(data);
    layout();
  };

  render();
  element.on('resize', layout);

  return {
    destroy() {
      element.destroy();
    },
    element,
    layout,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
