import type blessed from 'blessed';

import {
  type RenderQuickSwitcherOptions,
  renderQuickSwitcher,
} from '@/components/navigation/quick-switcher/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type QuickSwitcherBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export type QuickSwitcherData = Omit<RenderQuickSwitcherOptions, 'height' | 'width'>;
export interface QuickSwitcherOptions {
  box?: QuickSwitcherBoxOptions;
  data: QuickSwitcherData;
  parent: blessed.Widgets.Node;
}
export type QuickSwitcherHandle = BlessedComponentHandle<
  QuickSwitcherData,
  blessed.Widgets.BoxElement
>;

/** Creates a render-only QuickSwitcher backed by a Blessed box. */
export function quickSwitcher({ box, data, parent }: QuickSwitcherOptions): QuickSwitcherHandle {
  return createRenderBox({
    box,
    data,
    keys: true,
    mouse: true,
    parent,
    render: (nextData, { height, width }) => renderQuickSwitcher({ ...nextData, height, width }),
  });
}
