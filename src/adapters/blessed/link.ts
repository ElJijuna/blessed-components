import type blessed from 'blessed';

import { type RenderLinkOptions, renderLink } from '@/components/data-display/link/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type LinkBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type LinkData = Omit<RenderLinkOptions, 'width'> & { width?: number };
export interface LinkOptions {
  box?: LinkBoxOptions;
  data: LinkData;
  parent: blessed.Widgets.Node;
}
export type LinkHandle = BlessedComponentHandle<LinkData, blessed.Widgets.BoxElement>;

/** Creates a render-only Link backed by a Blessed box. */
export function link({ box, data, parent }: LinkOptions): LinkHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { width }) => renderLink({ ...nextData, width: nextData.width ?? width }),
  });
}
