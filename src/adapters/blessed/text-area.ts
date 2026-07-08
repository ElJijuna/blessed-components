import type blessed from 'blessed';

import { type RenderTextAreaOptions, renderTextArea } from '@/components/input/text-area/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type TextAreaBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export type TextAreaData = Omit<RenderTextAreaOptions, 'height' | 'width'>;
export interface TextAreaOptions {
  box?: TextAreaBoxOptions;
  data: TextAreaData;
  parent: blessed.Widgets.Node;
}
export type TextAreaHandle = BlessedComponentHandle<TextAreaData, blessed.Widgets.BoxElement>;

/** Creates a render-only TextArea backed by a Blessed box. */
export function textArea({ box, data, parent }: TextAreaOptions): TextAreaHandle {
  return createRenderBox({
    box,
    data,
    keys: true,
    mouse: true,
    parent,
    render: (nextData, { height, width }) => renderTextArea({ ...nextData, height, width }),
  });
}
