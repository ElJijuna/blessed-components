import blessed from 'blessed';

import {
  BANNER_ASCII_MARKERS,
  BANNER_UNICODE_MARKERS,
  type RenderBannerOptions,
  renderBanner,
} from '@/components/feedback/banner/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

export type BannerBoxOptions = BoxElementOptions;

export interface BannerData
  extends Omit<RenderBannerOptions, 'markers'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;
  markers?: RenderBannerOptions['markers'];
  foregroundTone?: keyof ThemeColors;
}

export interface BannerOptions {
  box?: BannerBoxOptions;
  data: BannerData;
  parent: blessed.Widgets.Node;
}

export type BannerHandle = BlessedComponentHandle<BannerData, blessed.Widgets.BoxElement>;

function dimension(value: blessed.Widgets.Types.TPosition): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined;
}

function toneToken(tone: BannerData['tone']): keyof ThemeColors {
  return tone === undefined || tone === 'neutral' ? 'foreground' : tone;
}

/** Creates a themed, persistent Banner backed by a Blessed box. */
export function banner({ box, data: initialData, parent }: BannerOptions): BannerHandle {
  let data = initialData;

  const element = blessed.box({ ...box, content: '', parent, tags: false });
  const style = createBoxStyleController(element, box, {}, { component: 'banner' });
  const render = (): void => {
    const capabilities = data.capabilities ?? detectCapabilities();
    const outerWidth = dimension(element.width);
    const inset = dimension(element.iwidth) ?? 0;
    const derivedWidth = outerWidth === undefined ? undefined : Math.max(0, outerWidth - inset);

    element.setContent(
      renderBanner({
        ...data,
        markers:
          data.markers ?? (capabilities.unicode ? BANNER_UNICODE_MARKERS : BANNER_ASCII_MARKERS),
        ...(data.width === undefined && derivedWidth !== undefined && derivedWidth > 0
          ? { width: derivedWidth }
          : {}),
      }),
    );
    style.apply({
      backgroundTone: data.backgroundTone ?? toneToken(data.tone),
      borderTone: data.borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: data.foregroundTone ?? 'background',
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
