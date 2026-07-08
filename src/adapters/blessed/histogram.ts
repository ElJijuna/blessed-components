import type blessed from 'blessed';

import {
  type RenderHistogramOptions,
  renderHistogram,
} from '@/components/visualization/histogram/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type HistogramBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type HistogramData = Omit<RenderHistogramOptions, 'height' | 'width'>;
export interface HistogramOptions {
  box?: HistogramBoxOptions;
  data: HistogramData;
  parent: blessed.Widgets.Node;
}
export type HistogramHandle = BlessedComponentHandle<HistogramData, blessed.Widgets.BoxElement>;

/** Creates a render-only Histogram backed by a Blessed box. */
export function histogram({ box, data, parent }: HistogramOptions): HistogramHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { height, width }) => renderHistogram({ ...nextData, height, width }),
  });
}
