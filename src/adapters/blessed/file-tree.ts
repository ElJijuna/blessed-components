import type blessed from 'blessed';

import {
  type RenderFileTreeOptions,
  renderFileTree,
} from '@/components/collections/file-tree/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type FileTreeBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type FileTreeData = Omit<RenderFileTreeOptions, 'height' | 'width'>;
export interface FileTreeOptions {
  box?: FileTreeBoxOptions;
  data: FileTreeData;
  parent: blessed.Widgets.Node;
}
export type FileTreeHandle = BlessedComponentHandle<FileTreeData, blessed.Widgets.BoxElement>;

/** Creates a render-only FileTree backed by a Blessed box. */
export function fileTree({ box, data, parent }: FileTreeOptions): FileTreeHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { height, width }) => renderFileTree({ ...nextData, height, width }),
  });
}
