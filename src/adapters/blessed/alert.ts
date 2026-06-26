import blessed from 'blessed';

import {
  ALERT_ASCII_MARKERS,
  ALERT_UNICODE_MARKERS,
  type RenderAlertOptions,
  renderAlert,
} from '@/components/feedback/alert/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Alert adapter. */
export type AlertBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link alert} adapter. */
export interface AlertData
  extends Omit<RenderAlertOptions, 'markers'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom semantic markers. */
  markers?: RenderAlertOptions['markers'];

  /** Semantic foreground token. Defaults to the alert tone. */
  foregroundTone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link alert} adapter. */
export interface AlertOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: AlertBoxOptions;

  /** Alert content, tone, markers, capabilities, and theme data. */
  data: AlertData;

  /** Blessed screen or node receiving the Alert. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link alert}. */
export type AlertHandle = BlessedComponentHandle<AlertData, blessed.Widgets.BoxElement>;

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

function toneToForegroundTone(tone: AlertData['tone']): keyof ThemeColors {
  return tone === undefined || tone === 'neutral' ? 'foreground' : tone;
}

/**
 * Creates a themed Alert backed by a Blessed box.
 *
 * The adapter derives missing width from the element, chooses ASCII markers
 * when Unicode is unavailable, and leaves screen rendering under caller
 * control.
 */
export function alert({ box, data: initialData, parent }: AlertOptions): AlertHandle {
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
    const { backgroundTone, borderTone, capabilities: configuredCapabilities, theme } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const markers =
      data.markers ?? (capabilities.unicode ? ALERT_UNICODE_MARKERS : ALERT_ASCII_MARKERS);
    const width = data.width ?? innerDimension(element.width, element.iwidth);

    element.setContent(
      renderAlert({
        ...data,
        markers,
        ...(width === undefined || width === 0 ? {} : { width }),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone: borderTone ?? toneToForegroundTone(data.tone),
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: data.foregroundTone ?? toneToForegroundTone(data.tone),
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
