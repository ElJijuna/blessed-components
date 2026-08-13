import blessed from 'blessed';
import {
  MODE_INDICATOR_ASCII_CHARACTERS,
  MODE_INDICATOR_UNICODE_CHARACTERS,
  type RenderModeIndicatorOptions,
  renderModeIndicator,
} from '@/components/feedback/mode-indicator/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

export type ModeIndicatorBoxOptions = BoxElementOptions;
export interface ModeIndicatorData extends Omit<RenderModeIndicatorOptions, 'characters'>, BoxData {
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;
  characters?: RenderModeIndicatorOptions['characters'];
}
export interface ModeIndicatorOptions {
  box?: ModeIndicatorBoxOptions;
  data: ModeIndicatorData;
  parent: blessed.Widgets.Node;
}
export type ModeIndicatorHandle = BlessedComponentHandle<
  ModeIndicatorData,
  blessed.Widgets.BoxElement
>;

/** Creates a themed ModeIndicator backed by a Blessed box. */
export function modeIndicator({
  box,
  data: initialData,
  parent,
}: ModeIndicatorOptions): ModeIndicatorHandle {
  let data = initialData;

  const element = blessed.box({
    height: 1,
    ...box,
    content: '',
    parent,
    style: { ...box?.style, border: { ...box?.style?.border } },
    tags: false,
  });
  const style = createBoxStyleController(element, box, {}, { component: 'mode-indicator' });
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderModeIndicator({
        ...data,
        characters:
          data.characters ??
          (capabilities.unicode
            ? MODE_INDICATOR_UNICODE_CHARACTERS
            : MODE_INDICATOR_ASCII_CHARACTERS),
      }),
    );
    style.apply({
      backgroundTone: data.backgroundTone,
      borderTone: data.borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: data.foregroundTone,
      theme: data.theme,
    });
  };

  render();

  return {
    destroy: () => element.destroy(),
    element,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
