import blessed from 'blessed';

import {
  type RenderStatusBarOptions,
  renderStatusBar,
  STATUS_BAR_ASCII_CHARACTERS,
  STATUS_BAR_UNICODE_CHARACTERS,
} from '@/components/feedback/status-bar/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the StatusBar adapter. */
export type StatusBarBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link statusBar} adapter. */
export interface StatusBarData
  extends Omit<RenderStatusBarOptions, 'characters' | 'width'>,
    BoxData {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom StatusBar separators. */
  characters?: RenderStatusBarOptions['characters'];

  /** Explicit render width. Defaults to the current Blessed element width. */
  width?: number;
}

/** Options accepted by the Blessed {@link statusBar} adapter. */
export interface StatusBarOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: StatusBarBoxOptions;

  /** StatusBar items, message, characters, capabilities, and theme data. */
  data?: StatusBarData;

  /** Blessed screen or node receiving the StatusBar. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link statusBar}. */
export type StatusBarHandle = BlessedComponentHandle<StatusBarData, blessed.Widgets.BoxElement>;

interface RuntimeBoxPosition {
  width?: number;
}

type RuntimeBoxElement = blessed.Widgets.BoxElement & {
  wpos?: RuntimeBoxPosition;
};

function numericDimension(value: blessed.Widgets.Types.TPosition | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function elementWidth(element: blessed.Widgets.BoxElement): number {
  const runtimeElement = element as RuntimeBoxElement;

  if (typeof runtimeElement.wpos?.width === 'number') {
    return Math.max(0, Math.floor(runtimeElement.wpos.width));
  }

  if (typeof element.lpos?.xi === 'number' && typeof element.lpos.xl === 'number') {
    return Math.max(0, element.lpos.xl - element.lpos.xi);
  }

  return numericDimension(element.width);
}

/**
 * Creates a themed application StatusBar backed by a Blessed box.
 *
 * The adapter chooses ASCII separators when Unicode is unavailable, derives
 * width from the element when not supplied, and leaves `screen.render()`
 * batching to callers.
 */
export function statusBar({
  box,
  data: initialData = {},
  parent,
}: StatusBarOptions): StatusBarHandle {
  let data = initialData;

  const element = blessed.box({
    height: 1,
    ...box,
    content: '',
    parent,
    style: {
      ...box?.style,
      border: { ...box?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, box, {}, { component: 'status-bar' });
  const render = (): void => {
    const { backgroundTone, borderTone, capabilities: configuredCapabilities, theme } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const characters =
      data.characters ??
      (capabilities.unicode ? STATUS_BAR_UNICODE_CHARACTERS : STATUS_BAR_ASCII_CHARACTERS);

    element.setContent(
      renderStatusBar({
        ...data,
        characters,
        width: data.width ?? elementWidth(element),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: data.foregroundTone,
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
