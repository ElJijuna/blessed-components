import blessed from 'blessed';

import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by simple render-only adapters. */
export type RenderBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

export interface RenderBoxViewport {
  height: number;
  width: number;
}

export interface CreateRenderBoxOptions<TData> {
  box?: RenderBoxOptions | undefined;
  data: TData;
  keys?: boolean;
  mouse?: boolean;
  parent: blessed.Widgets.Node;
  render: (data: TData, viewport: RenderBoxViewport) => string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function boxViewport(element: blessed.Widgets.BoxElement): RenderBoxViewport {
  return {
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  };
}

export function createRenderBox<TData>({
  box,
  data: initialData,
  keys = false,
  mouse = false,
  parent,
  render,
}: CreateRenderBoxOptions<TData>): BlessedComponentHandle<TData, blessed.Widgets.BoxElement> {
  let data = initialData;

  const element = blessed.box({
    keys,
    mouse,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const update = (): void => {
    element.setContent(render(data, boxViewport(element)));
  };

  update();
  element.on('resize', update);

  return {
    destroy() {
      element.destroy();
    },
    element,
    setData(nextData) {
      data = nextData;
      update();
    },
  };
}
