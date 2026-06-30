import blessed from 'blessed';

import {
  type ClusterAlign,
  type ClusterItemSize,
  calculateClusterLayout,
} from '@/components/layout/cluster/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Cluster adapter. */
export type ClusterBoxOptions = BoxElementOptions;

/** Stateful layout and theme data accepted by {@link cluster}. */
export interface ClusterData extends BoxData {
  /** Row alignment after wrapping. @defaultValue `'start'` */
  align?: ClusterAlign;

  /** Empty cells between adjacent children. Overrides `gap` horizontally. */
  columnGap?: number;

  /** Shared empty cells/rows between adjacent children and rows. @defaultValue `0` */
  gap?: number;

  /** Empty rows between wrapped rows. Overrides `gap` vertically. */
  rowGap?: number;
}

/** Options accepted by the Blessed {@link cluster} adapter. */
export interface ClusterOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: ClusterBoxOptions;

  /** Wrapping gaps, row alignment, and semantic theme data. */
  data?: ClusterData;

  /** Blessed screen or node receiving the Cluster container. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link cluster}. */
export interface ClusterHandle
  extends BlessedComponentHandle<ClusterData, blessed.Widgets.BoxElement> {
  /** Recalculates positions for current direct children. */
  layout(): void;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function isElement(node: blessed.Widgets.Node): node is blessed.Widgets.BlessedElement {
  return 'position' in node;
}

/**
 * Creates a themed container that wraps direct Blessed children into rows.
 *
 * Add or remove children, then call `layout()`. Resizing Cluster or calling
 * `setData()` triggers layout automatically.
 */
export function cluster({
  box: elementOptions,
  data: initialData = {},
  parent,
}: ClusterOptions): ClusterHandle {
  let data = initialData;

  const intrinsicSizes = new WeakMap<blessed.Widgets.Node, ClusterItemSize>();
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
    const items = children.map((child) => {
      const existing = intrinsicSizes.get(child);

      if (existing !== undefined) {
        return existing;
      }

      const size = {
        height: numericDimension(child.height),
        width: numericDimension(child.width),
      };

      intrinsicSizes.set(child, size);

      return size;
    });
    const width = Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
    const height = Math.max(
      0,
      numericDimension(element.height) - numericDimension(element.iheight),
    );
    const positions = calculateClusterLayout({
      ...(data.align === undefined ? {} : { align: data.align }),
      ...(data.columnGap === undefined ? {} : { columnGap: data.columnGap }),
      ...(data.gap === undefined ? {} : { gap: data.gap }),
      height,
      items,
      ...(data.rowGap === undefined ? {} : { rowGap: data.rowGap }),
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
