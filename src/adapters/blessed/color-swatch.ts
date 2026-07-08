import type blessed from 'blessed';

import {
  type RenderColorSwatchOptions,
  renderColorSwatch,
} from '@/components/data-display/color-swatch/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type ColorSwatchBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type ColorSwatchData = Omit<RenderColorSwatchOptions, 'width'> & { width?: number };
export interface ColorSwatchOptions {
  box?: ColorSwatchBoxOptions;
  data: ColorSwatchData;
  parent: blessed.Widgets.Node;
}
export type ColorSwatchHandle = BlessedComponentHandle<ColorSwatchData, blessed.Widgets.BoxElement>;

/** Creates a render-only ColorSwatch backed by a Blessed box. */
export function colorSwatch({ box, data, parent }: ColorSwatchOptions): ColorSwatchHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { width }) =>
      renderColorSwatch({ ...nextData, width: nextData.width ?? width }),
  });
}
