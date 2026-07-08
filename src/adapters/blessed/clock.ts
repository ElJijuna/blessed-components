import type blessed from 'blessed';

import { type RenderClockOptions, renderClock } from '@/components/data-display/clock/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type ClockBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type ClockData = Omit<RenderClockOptions, 'width'> & { width?: number };
export interface ClockOptions {
  box?: ClockBoxOptions;
  data: ClockData;
  parent: blessed.Widgets.Node;
}
export type ClockHandle = BlessedComponentHandle<ClockData, blessed.Widgets.BoxElement>;

/** Creates a render-only Clock backed by a Blessed box. */
export function clock({ box, data, parent }: ClockOptions): ClockHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { width }) => renderClock({ ...nextData, width: nextData.width ?? width }),
  });
}
