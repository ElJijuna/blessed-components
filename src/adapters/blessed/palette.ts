import type blessed from 'blessed';

import {
  type RenderPaletteOptions,
  renderPalette,
} from '@/components/data-display/palette/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type PaletteBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type PaletteData = Omit<RenderPaletteOptions, 'height' | 'width'>;
export interface PaletteOptions {
  box?: PaletteBoxOptions;
  data: PaletteData;
  parent: blessed.Widgets.Node;
}
export type PaletteHandle = BlessedComponentHandle<PaletteData, blessed.Widgets.BoxElement>;

/** Creates a render-only Palette backed by a Blessed box. */
export function palette({ box, data, parent }: PaletteOptions): PaletteHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { height, width }) => renderPalette({ ...nextData, height, width }),
  });
}
