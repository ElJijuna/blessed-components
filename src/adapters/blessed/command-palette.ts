import type blessed from 'blessed';

import {
  type RenderCommandPaletteOptions,
  renderCommandPalette,
} from '@/components/navigation/command-palette/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type CommandPaletteBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export type CommandPaletteData = Omit<RenderCommandPaletteOptions, 'height' | 'width'>;
export interface CommandPaletteOptions {
  box?: CommandPaletteBoxOptions;
  data: CommandPaletteData;
  parent: blessed.Widgets.Node;
}
export type CommandPaletteHandle = BlessedComponentHandle<
  CommandPaletteData,
  blessed.Widgets.BoxElement
>;

/** Creates a render-only CommandPalette backed by a Blessed box. */
export function commandPalette({ box, data, parent }: CommandPaletteOptions): CommandPaletteHandle {
  return createRenderBox({
    box,
    data,
    keys: true,
    mouse: true,
    parent,
    render: (nextData, { height, width }) => renderCommandPalette({ ...nextData, height, width }),
  });
}
