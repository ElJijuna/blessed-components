import type blessed from 'blessed';

import {
  type RenderInspectorOptions,
  renderInspector,
} from '@/components/collections/inspector/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type InspectorBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type InspectorData = Omit<RenderInspectorOptions, 'height' | 'width'>;
export interface InspectorOptions {
  box?: InspectorBoxOptions;
  data: InspectorData;
  parent: blessed.Widgets.Node;
}
export type InspectorHandle = BlessedComponentHandle<InspectorData, blessed.Widgets.BoxElement>;

/** Creates a render-only Inspector backed by a Blessed box. */
export function inspector({ box, data, parent }: InspectorOptions): InspectorHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { height, width }) => renderInspector({ ...nextData, height, width }),
  });
}
