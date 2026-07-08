import type blessed from 'blessed';

import {
  type RenderKeybindingInputOptions,
  renderKeybindingInput,
} from '@/components/input/keybinding-input/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type KeybindingInputBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export type KeybindingInputData = Omit<RenderKeybindingInputOptions, 'width'> & { width?: number };
export interface KeybindingInputOptions {
  box?: KeybindingInputBoxOptions;
  data: KeybindingInputData;
  parent: blessed.Widgets.Node;
}
export type KeybindingInputHandle = BlessedComponentHandle<
  KeybindingInputData,
  blessed.Widgets.BoxElement
>;

/** Creates a render-only KeybindingInput backed by a Blessed box. */
export function keybindingInput({
  box,
  data,
  parent,
}: KeybindingInputOptions): KeybindingInputHandle {
  return createRenderBox({
    box,
    data,
    keys: true,
    parent,
    render: (nextData, { width }) =>
      renderKeybindingInput({ ...nextData, width: nextData.width ?? width }),
  });
}
