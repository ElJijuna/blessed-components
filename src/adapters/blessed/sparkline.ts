import blessed from 'blessed';

import {
  type RenderSparklineOptions,
  renderSparkline,
} from '../../components/visualization/sparkline/index.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by the Sparkline adapter.
 *
 * `parent`, `content`, and `tags` are controlled by {@link sparkline}.
 */
export type SparklineBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Options accepted by the Blessed {@link sparkline} adapter. */
export interface SparklineOptions {
  /** Optional position, dimensions, style, and other Blessed box settings. */
  box?: SparklineBoxOptions;

  /** Data passed to the pure {@link renderSparkline} renderer. */
  data: RenderSparklineOptions;

  /** Blessed screen or node that receives the created box. */
  parent: blessed.Widgets.Node;
}

/**
 * Imperative handle returned by {@link sparkline}.
 *
 * The handle owns one box, never owns the parent screen, and never calls
 * `screen.render()`.
 */
export type SparklineHandle = BlessedComponentHandle<
  RenderSparklineOptions,
  blessed.Widgets.BoxElement
>;

/**
 * Creates a display-only Sparkline backed by a Blessed `BoxElement`.
 *
 * Import from `blessed-components/sparkline/blessed`. The adapter disables
 * Blessed tags, renders through {@link renderSparkline}, and leaves terminal
 * rendering under caller control.
 *
 * @param options - Parent node, renderer data, and optional box settings.
 * @returns Handle for the created box, updates, and cleanup.
 *
 * @throws `RangeError`
 * Propagates validation errors from {@link renderSparkline}.
 *
 * @example
 *
 * ```ts
 * import blessed from 'blessed';
 * import { sparkline } from 'blessed-components/sparkline/blessed';
 *
 * const screen = blessed.screen({ smartCSR: true });
 * const downloads = sparkline({
 *   parent: screen,
 *   box: { top: 0, left: 0, width: 40, height: 2 },
 *   data: {
 *     label: 'Downloads',
 *     values: [1, 3, 2, 8],
 *     width: 20,
 *   },
 * });
 *
 * screen.render();
 * downloads.setData({
 *   label: 'Downloads',
 *   values: [2, 4, 6, 8],
 *   width: 20,
 * });
 * screen.render();
 *
 * downloads.destroy();
 * screen.destroy();
 * ```
 */
export function sparkline({ box, data, parent }: SparklineOptions): SparklineHandle {
  const element = blessed.box({
    ...box,
    content: renderSparkline(data),
    parent,
    tags: false,
  });

  return {
    element,
    destroy() {
      element.destroy();
    },
    setData(nextData) {
      element.setContent(renderSparkline(nextData));
    },
  };
}
