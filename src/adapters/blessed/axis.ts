import type blessed from 'blessed';

import { type RenderAxisOptions, renderAxis } from '@/components/visualization/axis/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type AxisBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type AxisData = Omit<RenderAxisOptions, 'width'> & { width?: number };
export interface AxisOptions {
  box?: AxisBoxOptions;
  data: AxisData;
  parent: blessed.Widgets.Node;
}
export type AxisHandle = BlessedComponentHandle<AxisData, blessed.Widgets.BoxElement>;

/** Creates a render-only Axis backed by a Blessed box. */
export function axis({ box, data, parent }: AxisOptions): AxisHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { width }) => renderAxis({ ...nextData, width: nextData.width ?? width }),
  });
}
