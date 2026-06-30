import blessed from 'blessed';

import {
  type CenterAlign,
  type CenterChildSize,
  calculateCenterLayout,
} from '@/components/layout/center/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Center adapter. */
export type CenterBoxOptions = BoxElementOptions;

/** Stateful layout and theme data accepted by {@link center}. */
export interface CenterData extends BoxData {
  /** Horizontal child alignment. @defaultValue `'center'` */
  horizontal?: CenterAlign;

  /** Optional explicit child size. Defaults to the first child dimensions. */
  item?: CenterChildSize;

  /** Vertical child alignment. @defaultValue `'center'` */
  vertical?: CenterAlign;
}

/** Options accepted by the Blessed {@link center} adapter. */
export interface CenterOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: CenterBoxOptions;

  /** Alignment, optional child size, and semantic theme data. */
  data?: CenterData;

  /** Blessed screen or node receiving the Center container. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link center}. */
export interface CenterHandle
  extends BlessedComponentHandle<CenterData, blessed.Widgets.BoxElement> {
  /** Recalculates the first direct child's position. */
  layout(): void;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function isElement(node: blessed.Widgets.Node): node is blessed.Widgets.BlessedElement {
  return 'position' in node;
}

/**
 * Creates a themed container that centers its first direct Blessed child.
 *
 * Add or replace the child, then call `layout()`. Resizing Center or calling
 * `setData()` recalculates child position automatically.
 */
export function center({
  box: elementOptions,
  data: initialData = {},
  parent,
}: CenterOptions): CenterHandle {
  let data = initialData;

  const intrinsicSizes = new WeakMap<blessed.Widgets.Node, CenterChildSize>();
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
    const child = element.children.find(isElement);

    if (child === undefined) {
      return;
    }

    const existing = intrinsicSizes.get(child);
    const item =
      data.item ??
      existing ??
      ({
        height: numericDimension(child.height),
        width: numericDimension(child.width),
      } satisfies CenterChildSize);

    intrinsicSizes.set(child, item);

    const width = Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
    const height = Math.max(
      0,
      numericDimension(element.height) - numericDimension(element.iheight),
    );
    const position = calculateCenterLayout({
      height,
      ...(data.horizontal === undefined ? {} : { horizontal: data.horizontal }),
      item,
      ...(data.vertical === undefined ? {} : { vertical: data.vertical }),
      width,
    });

    child.left = position.x;
    child.top = position.y;
    child.width = position.width;
    child.height = position.height;
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
