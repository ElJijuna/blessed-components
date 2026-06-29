import blessed from 'blessed';

import {
  type RenderTimelineOptions,
  renderTimeline,
} from '@/components/collections/timeline/index.js';
import {
  STATUS_ASCII_MARKERS,
  STATUS_UNICODE_MARKERS,
} from '@/components/feedback/status/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Timeline adapter. */
export type TimelineBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link timeline} adapter. */
export interface TimelineData
  extends Omit<RenderTimelineOptions, 'height' | 'markers' | 'width'>,
    Omit<BoxData, 'capabilities'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom semantic markers. */
  markers?: RenderTimelineOptions['markers'];
}

/** Options accepted by the Blessed {@link timeline} adapter. */
export interface TimelineOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: TimelineBoxOptions;

  /** Timeline items, viewport offset, timestamp, and marker options. */
  data: TimelineData;

  /** Blessed screen or node receiving the Timeline. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link timeline}. */
export type TimelineHandle = BlessedComponentHandle<TimelineData, blessed.Widgets.BoxElement>;

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/**
 * Creates a themed Timeline backed by a Blessed box.
 *
 * The adapter selects Unicode or ASCII markers from terminal capabilities,
 * sizes the pure renderer from the element viewport, and leaves render batching
 * to applications.
 */
export function timeline({ box, data: initialData, parent }: TimelineOptions): TimelineHandle {
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
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const render = (): void => {
    const { backgroundTone, borderTone, capabilities: configuredCapabilities, theme } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const markers =
      data.markers ?? (capabilities.unicode ? STATUS_UNICODE_MARKERS : STATUS_ASCII_MARKERS);
    const dimensions = viewportSize();

    element.setContent(
      renderTimeline({
        ...data,
        height: dimensions.height,
        markers,
        width: dimensions.width,
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
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
