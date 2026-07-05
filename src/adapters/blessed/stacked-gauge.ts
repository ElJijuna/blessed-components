import blessed from 'blessed';

import {
  type RenderStackedGaugeOptions,
  renderStackedGauge,
  STACKED_GAUGE_ASCII_CHARACTERS,
  STACKED_GAUGE_UNICODE_CHARACTERS,
} from '@/components/visualization/stacked-gauge/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the StackedGauge adapter. */
export type StackedGaugeBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link stackedGauge} adapter. */
export interface StackedGaugeData
  extends Omit<RenderStackedGaugeOptions, 'characters'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom stacked gauge characters. */
  characters?: RenderStackedGaugeOptions['characters'];

  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link stackedGauge} adapter. */
export interface StackedGaugeOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: StackedGaugeBoxOptions;

  /** Segment data, layout, capabilities, and theme data. */
  data: StackedGaugeData;

  /** Blessed screen or node receiving the StackedGauge. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link stackedGauge}. */
export type StackedGaugeHandle = BlessedComponentHandle<
  StackedGaugeData,
  blessed.Widgets.BoxElement
>;

function numericDimension(value: blessed.Widgets.Types.TPosition): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined;
}

function innerDimension(
  outer: blessed.Widgets.Types.TPosition,
  inset: blessed.Widgets.Types.TPosition,
): number | undefined {
  const outerSize = numericDimension(outer);

  return outerSize === undefined
    ? undefined
    : Math.max(0, outerSize - (numericDimension(inset) ?? 0));
}

/** Creates a display-only StackedGauge backed by a Blessed box. */
export function stackedGauge({
  box,
  data: initialData,
  parent,
}: StackedGaugeOptions): StackedGaugeHandle {
  let data = initialData;

  const element = blessed.box({
    ...box,
    content: '',
    parent,
    style: {
      ...box?.style,
      border: { ...box?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, box);
  const render = (): void => {
    const { backgroundTone, borderTone, capabilities: configuredCapabilities, theme, tone } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const height = data.height ?? innerDimension(element.height, element.iheight);
    const characters =
      data.characters ??
      (capabilities.unicode
        ? {
            empty: '░',
            leftCap: '[',
            rightCap: ']',
            segments: STACKED_GAUGE_UNICODE_CHARACTERS,
          }
        : {
            empty: '-',
            leftCap: '[',
            rightCap: ']',
            segments: STACKED_GAUGE_ASCII_CHARACTERS,
          });

    element.setContent(
      renderStackedGauge({
        ...data,
        characters,
        ...(height === undefined ? {} : { height }),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: tone,
      theme,
    });
  };

  render();
  element.on('resize', render);

  return {
    destroy() {
      element.destroy();
    },
    element,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
