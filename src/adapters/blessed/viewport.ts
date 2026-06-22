import blessed from 'blessed';

import { calculateViewportLayout } from '@/components/layout/viewport/index.js';
import {
  createViewport,
  type ViewportOffsetInput,
  type ViewportRect,
  type ViewportSnapshot,
} from '@/primitives/viewport/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Viewport adapter. */
export type ViewportBoxOptions = BoxElementOptions;

/** Stateful dimensions, offset, and theme accepted by {@link viewport}. */
export interface ViewportData extends BoxData {
  /** Total content height in rows. */
  contentHeight: number;

  /** Total content width in cells. */
  contentWidth: number;

  /** Optional absolute horizontal offset. */
  x?: number;

  /** Optional absolute vertical offset. */
  y?: number;
}

/** Options accepted by the Blessed {@link viewport} adapter. */
export interface ViewportOptions {
  /** Position, visible dimensions, border, padding, and standard settings. */
  box?: ViewportBoxOptions;

  /** Content dimensions, optional offset, and semantic theme. */
  data: ViewportData;

  /** Blessed screen or node receiving the visible container. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link viewport}. */
export interface ViewportHandle
  extends BlessedComponentHandle<ViewportData, blessed.Widgets.BoxElement> {
  /** Inner element that receives caller-owned content children. */
  readonly contentElement: blessed.Widgets.BoxElement;

  /** Scrolls the minimum distance needed to reveal a content rectangle. */
  ensureVisible(rect: ViewportRect): ViewportSnapshot;

  /** Re-measures visible dimensions from the Blessed container. */
  resize(): ViewportSnapshot;

  /** Scrolls by relative terminal cells and rows. */
  scrollBy(offset: ViewportOffsetInput): ViewportSnapshot;

  /** Scrolls to an absolute content offset. */
  scrollTo(offset: ViewportOffsetInput): ViewportSnapshot;

  /** Returns current visible dimensions, content dimensions, and offsets. */
  snapshot(): ViewportSnapshot;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/**
 * Creates a themed clipping container over a larger composable content box.
 *
 * Add children to `contentElement` using content coordinates. The adapter
 * translates that element from the headless two-dimensional Viewport model.
 */
export function viewport({
  box: elementOptions,
  data: initialData,
  parent,
}: ViewportOptions): ViewportHandle {
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
  const visibleSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const initialVisibleSize = visibleSize();
  const model = createViewport({
    contentHeight: data.contentHeight,
    contentWidth: data.contentWidth,
    height: initialVisibleSize.height,
    width: initialVisibleSize.width,
    ...(data.x === undefined ? {} : { x: data.x }),
    ...(data.y === undefined ? {} : { y: data.y }),
  });
  const contentElement = blessed.box({
    content: '',
    height: data.contentHeight,
    left: 0,
    parent: element,
    tags: false,
    top: 0,
    width: data.contentWidth,
  });
  const style = createBoxStyleController(element, elementOptions);
  const applySnapshot = (snapshot: ViewportSnapshot): ViewportSnapshot => {
    const layout = calculateViewportLayout(snapshot);

    contentElement.left = layout.content.left;
    contentElement.top = layout.content.top;
    contentElement.width = layout.content.width;
    contentElement.height = layout.content.height;

    return snapshot;
  };
  const resize = (): ViewportSnapshot => applySnapshot(model.resize(visibleSize()));
  const render = (): void => {
    style.apply(data);
    model.setContentSize({
      height: data.contentHeight,
      width: data.contentWidth,
    });

    if (data.x !== undefined || data.y !== undefined) {
      model.scrollTo({
        ...(data.x === undefined ? {} : { x: data.x }),
        ...(data.y === undefined ? {} : { y: data.y }),
      });
    }

    resize();
  };
  const handle: ViewportHandle = {
    contentElement,
    destroy() {
      element.destroy();
    },
    element,
    ensureVisible(rect) {
      return applySnapshot(model.ensureVisible(rect));
    },
    resize,
    scrollBy(offset) {
      return applySnapshot(model.scrollBy(offset));
    },
    scrollTo(offset) {
      return applySnapshot(model.scrollTo(offset));
    },
    setData(nextData) {
      data = nextData;
      render();
    },
    snapshot: model.snapshot,
  };

  element.on('resize', resize);
  render();

  return handle;
}
