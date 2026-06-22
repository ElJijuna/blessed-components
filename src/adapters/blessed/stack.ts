import blessed from 'blessed';

import {
  calculateStackLayout,
  type StackAlign,
  type StackDirection,
  type StackItemSize,
} from '@/components/layout/stack/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Stack adapter. */
export type StackBoxOptions = BoxElementOptions;

/** Stateful layout and theme data accepted by {@link stack}. */
export interface StackData extends BoxData {
  /** Cross-axis child alignment. @defaultValue `'stretch'` */
  align?: StackAlign;

  /** Main-axis flow direction. @defaultValue `'vertical'` */
  direction?: StackDirection;

  /** Empty cells or rows between direct children. @defaultValue `0` */
  gap?: number;
}

/** Options accepted by the Blessed {@link stack} adapter. */
export interface StackOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: StackBoxOptions;

  /** Layout direction, gap, alignment, and semantic theme data. */
  data?: StackData;

  /** Blessed screen or node receiving the Stack container. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link stack}. */
export interface StackHandle extends BlessedComponentHandle<StackData, blessed.Widgets.BoxElement> {
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
 * Creates a themed container that lays out its direct Blessed children.
 *
 * Add or remove children, then call `layout()`. Resizing Stack or calling
 * `setData()` triggers layout automatically.
 */
export function stack({
  box: elementOptions,
  data: initialData = {},
  parent,
}: StackOptions): StackHandle {
  let data = initialData;

  const intrinsicSizes = new WeakMap<blessed.Widgets.Node, StackItemSize>();
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
    const positions = calculateStackLayout({
      ...(data.align === undefined ? {} : { align: data.align }),
      ...(data.direction === undefined ? {} : { direction: data.direction }),
      ...(data.gap === undefined ? {} : { gap: data.gap }),
      height,
      items,
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
