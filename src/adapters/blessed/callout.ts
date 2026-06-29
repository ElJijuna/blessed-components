import blessed from 'blessed';

import {
  CALLOUT_ASCII_BORDER,
  CALLOUT_ASCII_MARKERS,
  CALLOUT_UNICODE_BORDER,
  CALLOUT_UNICODE_MARKERS,
  type RenderCalloutOptions,
  renderCallout,
} from '@/components/feedback/callout/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Callout adapter. */
export type CalloutBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link callout} adapter. */
export interface CalloutData
  extends Omit<RenderCalloutOptions, 'border' | 'markers'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom border characters. */
  border?: RenderCalloutOptions['border'];

  /** Semantic foreground token. Defaults to the callout tone. */
  foregroundTone?: keyof ThemeColors;

  /** Custom semantic markers. */
  markers?: RenderCalloutOptions['markers'];
}

/** Options accepted by the Blessed {@link callout} adapter. */
export interface CalloutOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: CalloutBoxOptions;

  /** Callout content, tone, markers, border, capabilities, and theme data. */
  data: CalloutData;

  /** Blessed screen or node receiving the Callout. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link callout}. */
export type CalloutHandle = BlessedComponentHandle<CalloutData, blessed.Widgets.BoxElement>;

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

function toneToForegroundTone(tone: CalloutData['tone']): keyof ThemeColors {
  return tone === undefined || tone === 'neutral' ? 'foreground' : tone;
}

/**
 * Creates a themed Callout backed by a Blessed box.
 *
 * The adapter derives missing width from the element, chooses ASCII borders
 * when Unicode is unavailable, and leaves screen rendering under caller
 * control.
 */
export function callout({ box, data: initialData, parent }: CalloutOptions): CalloutHandle {
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
    const {
      backgroundTone,
      border: configuredBorder,
      borderTone,
      capabilities: configuredCapabilities,
      foregroundTone,
      markers: configuredMarkers,
      theme,
      ...renderData
    } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const border =
      configuredBorder ?? (capabilities.unicode ? CALLOUT_UNICODE_BORDER : CALLOUT_ASCII_BORDER);
    const markers =
      configuredMarkers ?? (capabilities.unicode ? CALLOUT_UNICODE_MARKERS : CALLOUT_ASCII_MARKERS);
    const width = renderData.width ?? innerDimension(element.width, element.iwidth);

    element.setContent(
      renderCallout({
        ...renderData,
        border,
        markers,
        ...(width === undefined || width === 0 ? {} : { width }),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone: borderTone ?? toneToForegroundTone(renderData.tone),
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: foregroundTone ?? toneToForegroundTone(renderData.tone),
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
