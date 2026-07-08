import type blessed from 'blessed';

import {
  type RenderAutocompleteOptions,
  renderAutocomplete,
} from '@/components/input/autocomplete/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type AutocompleteBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export type AutocompleteData = Omit<RenderAutocompleteOptions, 'height' | 'width'>;
export interface AutocompleteOptions {
  box?: AutocompleteBoxOptions;
  data: AutocompleteData;
  parent: blessed.Widgets.Node;
}
export type AutocompleteHandle = BlessedComponentHandle<
  AutocompleteData,
  blessed.Widgets.BoxElement
>;

/** Creates a render-only Autocomplete backed by a Blessed box. */
export function autocomplete({ box, data, parent }: AutocompleteOptions): AutocompleteHandle {
  return createRenderBox({
    box,
    data,
    keys: true,
    mouse: true,
    parent,
    render: (nextData, { height, width }) => renderAutocomplete({ ...nextData, height, width }),
  });
}
