import type blessed from 'blessed';

import {
  type RenderBulletChartOptions,
  renderBulletChart,
} from '@/components/visualization/bullet-chart/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type BulletChartBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type BulletChartData = Omit<RenderBulletChartOptions, 'width'> & { width?: number };
export interface BulletChartOptions {
  box?: BulletChartBoxOptions;
  data: BulletChartData;
  parent: blessed.Widgets.Node;
}
export type BulletChartHandle = BlessedComponentHandle<BulletChartData, blessed.Widgets.BoxElement>;

/** Creates a render-only BulletChart backed by a Blessed box. */
export function bulletChart({ box, data, parent }: BulletChartOptions): BulletChartHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { width }) =>
      renderBulletChart({ ...nextData, width: nextData.width ?? width }),
  });
}
