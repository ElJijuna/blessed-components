import type blessed from 'blessed';

import {
  type RenderAsciiArtOptions,
  renderAsciiArt,
} from '@/components/data-display/ascii-art/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type AsciiArtBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type AsciiArtData = Omit<RenderAsciiArtOptions, 'height' | 'width'>;
export interface AsciiArtOptions {
  box?: AsciiArtBoxOptions;
  data: AsciiArtData;
  parent: blessed.Widgets.Node;
}
export type AsciiArtHandle = BlessedComponentHandle<AsciiArtData, blessed.Widgets.BoxElement>;

/** Creates a render-only AsciiArt backed by a Blessed box. */
export function asciiArt({ box, data, parent }: AsciiArtOptions): AsciiArtHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { height, width }) => renderAsciiArt({ ...nextData, height, width }),
  });
}
