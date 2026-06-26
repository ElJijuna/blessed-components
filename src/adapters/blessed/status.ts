import blessed from 'blessed';

import {
  type RenderStatusOptions,
  renderStatus,
  STATUS_ASCII_MARKERS,
  STATUS_UNICODE_MARKERS,
} from '@/components/feedback/status/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Status adapter. */
export type StatusBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link status} adapter. */
export interface StatusData
  extends Omit<RenderStatusOptions, 'markers'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom ordered semantic markers. */
  markers?: RenderStatusOptions['markers'];

  /** Semantic foreground token. Defaults to the status tone. */
  foregroundTone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link status} adapter. */
export interface StatusOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: StatusBoxOptions;

  /** Status text, tone, markers, capabilities, and theme data. */
  data: StatusData;

  /** Blessed screen or node receiving the Status. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link status}. */
export type StatusHandle = BlessedComponentHandle<StatusData, blessed.Widgets.BoxElement>;

function toneToForegroundTone(tone: StatusData['tone']): keyof ThemeColors {
  return tone === undefined || tone === 'neutral' ? 'foreground' : tone;
}

/**
 * Creates a themed inline Status backed by a Blessed box.
 *
 * The adapter chooses ASCII markers when Unicode is unavailable, applies
 * semantic foreground color, and leaves `screen.render()` batching to callers.
 */
export function status({ box, data: initialData, parent }: StatusOptions): StatusHandle {
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
      data.markers ?? (capabilities.unicode ? STATUS_UNICODE_MARKERS : STATUS_ASCII_MARKERS);

    element.setContent(
      renderStatus({
        ...data,
        markers,
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: data.foregroundTone ?? toneToForegroundTone(data.tone),
      theme,
    });
  };

  render();

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
