import blessed from 'blessed';

import {
  CONNECTION_STATUS_ASCII_MARKERS,
  CONNECTION_STATUS_UNICODE_MARKERS,
  type RenderConnectionStatusOptions,
  renderConnectionStatus,
} from '@/components/feedback/connection-status/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the ConnectionStatus adapter. */
export type ConnectionStatusBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link connectionStatus} adapter. */
export interface ConnectionStatusData
  extends Omit<RenderConnectionStatusOptions, 'markers'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Semantic foreground token. Defaults to the connection state tone. */
  foregroundTone?: keyof ThemeColors;

  /** Custom semantic markers. */
  markers?: RenderConnectionStatusOptions['markers'];
}

/** Options accepted by the Blessed {@link connectionStatus} adapter. */
export interface ConnectionStatusOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: ConnectionStatusBoxOptions;

  /** Connection state, latency, markers, capabilities, and theme data. */
  data: ConnectionStatusData;

  /** Blessed screen or node receiving the ConnectionStatus. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link connectionStatus}. */
export type ConnectionStatusHandle = BlessedComponentHandle<
  ConnectionStatusData,
  blessed.Widgets.BoxElement
>;

function stateToForegroundTone(state: ConnectionStatusData['state']): keyof ThemeColors {
  if (state === 'offline') {
    return 'danger';
  }

  if (state === 'reconnecting') {
    return 'warning';
  }

  return 'success';
}

/**
 * Creates a themed inline ConnectionStatus backed by a Blessed box.
 *
 * The adapter chooses ASCII markers when Unicode is unavailable, applies
 * semantic foreground color, and leaves `screen.render()` batching to callers.
 */
export function connectionStatus({
  box,
  data: initialData,
  parent,
}: ConnectionStatusOptions): ConnectionStatusHandle {
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
      borderTone,
      capabilities: configuredCapabilities,
      foregroundTone,
      markers: configuredMarkers,
      theme,
      ...renderData
    } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const markers =
      configuredMarkers ??
      (capabilities.unicode ? CONNECTION_STATUS_UNICODE_MARKERS : CONNECTION_STATUS_ASCII_MARKERS);

    element.setContent(
      renderConnectionStatus({
        ...renderData,
        markers,
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: foregroundTone ?? stateToForegroundTone(renderData.state),
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
