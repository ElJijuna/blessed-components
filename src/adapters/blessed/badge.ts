import blessed from 'blessed';

import { type RenderBadgeOptions, renderBadge } from '../../components/badge/index.js';

/**
 * Blessed box options supported by the Badge adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link badge}.
 */
export type BadgeBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Options accepted by the Blessed {@link badge} adapter. */
export interface BadgeOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: BadgeBoxOptions;

  /** Data passed to the pure {@link renderBadge} renderer. */
  data: RenderBadgeOptions;

  /** Blessed screen or node that receives the created box. */
  parent: blessed.Widgets.Node;
}

/**
 * Imperative handle returned by {@link badge}.
 *
 * The handle owns one box, never owns the parent screen, and never calls
 * `screen.render()`.
 */
export interface BadgeHandle {
  /** Underlying Blessed box used for standard element operations. */
  readonly element: blessed.Widgets.BoxElement;

  /** Destroys and detaches the owned box without destroying its parent. */
  destroy(): void;

  /**
   * Replaces renderer data while preserving the Blessed element.
   *
   * Call `screen.render()` when updates should become visible.
   *
   * @param data - Complete renderer data replacing the previous data.
   *
   * @throws `RangeError`
   * Propagates validation errors from {@link renderBadge}.
   */
  setData(data: RenderBadgeOptions): void;
}

/**
 * Creates a display-only Badge backed by a Blessed `BoxElement`.
 *
 * Import from `blessed-components/badge/blessed`. The adapter disables
 * Blessed tags, renders through {@link renderBadge}, and leaves screen
 * rendering under caller control.
 *
 * @param options - Parent node, renderer data, and optional box settings.
 * @returns Handle for the created box, updates, and cleanup.
 *
 * @throws `RangeError`
 * Propagates validation errors from {@link renderBadge}.
 *
 * @example
 *
 * ```ts
 * import blessed from 'blessed';
 * import { badge } from 'blessed-components/badge/blessed';
 *
 * const screen = blessed.screen({ smartCSR: true });
 * const status = badge({
 *   parent: screen,
 *   box: { top: 0, left: 0, width: 20, height: 1 },
 *   data: {
 *     text: 'Queued',
 *     tone: 'info',
 *   },
 * });
 *
 * screen.render();
 * status.setData({
 *   text: 'Passed',
 *   tone: 'success',
 * });
 * screen.render();
 *
 * status.destroy();
 * screen.destroy();
 * ```
 */
export function badge({ box, data, parent }: BadgeOptions): BadgeHandle {
  const element = blessed.box({
    ...box,
    content: renderBadge(data),
    parent,
    tags: false,
  });

  return {
    element,
    destroy() {
      element.destroy();
    },
    setData(nextData) {
      element.setContent(renderBadge(nextData));
    },
  };
}
