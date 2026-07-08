import type blessed from 'blessed';

import { type RenderTimerOptions, renderTimer } from '@/components/data-display/timer/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type TimerBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type TimerData = Omit<RenderTimerOptions, 'width'> & { width?: number };
export interface TimerOptions {
  box?: TimerBoxOptions;
  data: TimerData;
  parent: blessed.Widgets.Node;
}
export type TimerHandle = BlessedComponentHandle<TimerData, blessed.Widgets.BoxElement>;

/** Creates a render-only Timer backed by a Blessed box. */
export function timer({ box, data, parent }: TimerOptions): TimerHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { width }) => renderTimer({ ...nextData, width: nextData.width ?? width }),
  });
}
