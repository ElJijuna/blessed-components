import type blessed from 'blessed';

import { type RenderComboboxOptions, renderCombobox } from '@/components/input/combobox/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type ComboboxBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type ComboboxData = Omit<RenderComboboxOptions, 'height' | 'width'>;
export interface ComboboxOptions {
  box?: ComboboxBoxOptions;
  data: ComboboxData;
  parent: blessed.Widgets.Node;
}
export type ComboboxHandle = BlessedComponentHandle<ComboboxData, blessed.Widgets.BoxElement>;

/** Creates a render-only Combobox backed by a Blessed box. */
export function combobox({ box, data, parent }: ComboboxOptions): ComboboxHandle {
  return createRenderBox({
    box,
    data,
    keys: true,
    mouse: true,
    parent,
    render: (nextData, { height, width }) => renderCombobox({ ...nextData, height, width }),
  });
}
