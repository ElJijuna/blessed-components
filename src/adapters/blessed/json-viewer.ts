import type blessed from 'blessed';

import {
  type RenderJsonViewerOptions,
  renderJsonViewer,
} from '@/components/collections/json-viewer/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type JsonViewerBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type JsonViewerData = Omit<RenderJsonViewerOptions, 'height' | 'width'>;
export interface JsonViewerOptions {
  box?: JsonViewerBoxOptions;
  data: JsonViewerData;
  parent: blessed.Widgets.Node;
}
export type JsonViewerHandle = BlessedComponentHandle<JsonViewerData, blessed.Widgets.BoxElement>;

/** Creates a render-only JsonViewer backed by a Blessed box. */
export function jsonViewer({ box, data, parent }: JsonViewerOptions): JsonViewerHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { height, width }) => renderJsonViewer({ ...nextData, height, width }),
  });
}
