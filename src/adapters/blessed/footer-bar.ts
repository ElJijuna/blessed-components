import blessed from 'blessed';

import {
  FOOTER_BAR_ASCII_CHARACTERS,
  FOOTER_BAR_UNICODE_CHARACTERS,
  type RenderFooterBarOptions,
  renderFooterBar,
} from '@/components/feedback/footer-bar/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

export type FooterBarBoxOptions = BoxElementOptions;
export interface FooterBarData
  extends Omit<RenderFooterBarOptions, 'characters' | 'width'>,
    BoxData {
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;
  characters?: RenderFooterBarOptions['characters'];
  width?: number;
}
export interface FooterBarOptions {
  box?: FooterBarBoxOptions;
  data?: FooterBarData;
  parent: blessed.Widgets.Node;
}
export type FooterBarHandle = BlessedComponentHandle<FooterBarData, blessed.Widgets.BoxElement>;

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a themed FooterBar backed by a bottom-aligned Blessed box. */
export function footerBar({
  box,
  data: initialData = {},
  parent,
}: FooterBarOptions): FooterBarHandle {
  let data = initialData;

  const element = blessed.box({
    bottom: 0,
    height: 1,
    left: 0,
    right: 0,
    ...box,
    content: '',
    parent,
    style: { ...box?.style, border: { ...box?.style?.border } },
    tags: false,
  });
  const style = createBoxStyleController(element, box, {}, { component: 'footer-bar' });
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderFooterBar({
        ...data,
        characters:
          data.characters ??
          (capabilities.unicode ? FOOTER_BAR_UNICODE_CHARACTERS : FOOTER_BAR_ASCII_CHARACTERS),
        width: data.width ?? Math.max(0, dimension(element.width) - dimension(element.iwidth)),
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
  element.on('resize', render);

  return {
    destroy: () => element.destroy(),
    element,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
