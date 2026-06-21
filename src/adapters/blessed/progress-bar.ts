import blessed from 'blessed';

import {
  type RenderProgressBarOptions,
  renderProgressBar,
} from '../../components/progress-bar/index.js';

/**
 * Blessed box options supported by the ProgressBar adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link progressBar}:
 *
 * - `parent` comes from {@link ProgressBarOptions.parent}.
 * - `content` comes from {@link renderProgressBar}.
 * - `tags` is always disabled so labels and formatter output remain literal.
 */
export type ProgressBarBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/**
 * Options accepted by the Blessed {@link progressBar} adapter.
 */
export interface ProgressBarOptions {
  /**
   * Optional Blessed box configuration.
   *
   * Position, dimensions, style, visibility, and other regular box options
   * can be supplied here.
   */
  box?: ProgressBarBoxOptions;

  /**
   * Data passed to the pure {@link renderProgressBar} renderer.
   */
  data: RenderProgressBarOptions;

  /**
   * Blessed node that receives the created box as a child.
   *
   * Usually this is a `Screen` or another `BoxElement`.
   */
  parent: blessed.Widgets.Node;
}

/**
 * Imperative handle returned by {@link progressBar}.
 *
 * The handle owns one Blessed `BoxElement`. It does not own the parent screen
 * and never calls `screen.render()`, allowing callers to batch several updates
 * into one terminal render.
 */
export interface ProgressBarHandle {
  /**
   * Underlying Blessed box.
   *
   * Use this for standard Blessed operations such as positioning, showing,
   * hiding, or applying styles.
   */
  readonly element: blessed.Widgets.BoxElement;

  /**
   * Destroys and detaches the owned box from its parent.
   *
   * This does not destroy the parent or screen. Do not use the handle after
   * calling this method.
   */
  destroy(): void;

  /**
   * Re-renders component content using new data.
   *
   * The underlying element is preserved. This method does not call
   * `screen.render()`; call it explicitly when updates should become visible.
   *
   * @param data - Complete renderer data replacing the previous data.
   *
   * @throws `RangeError`
   * Propagates validation errors from {@link renderProgressBar}.
   */
  setData(data: RenderProgressBarOptions): void;
}

/**
 * Creates a display-only ProgressBar backed by a Blessed `BoxElement`.
 *
 * Import this adapter from `blessed-components/progress-bar/blessed`. Use
 * {@link renderProgressBar} from `blessed-components/progress-bar` when a
 * Blessed element is unnecessary.
 *
 * The adapter:
 *
 * - renders initial content through {@link renderProgressBar};
 * - disables Blessed tags to keep dynamic text literal;
 * - updates the existing element through {@link ProgressBarHandle.setData};
 * - leaves screen rendering under caller control;
 * - detaches its element through {@link ProgressBarHandle.destroy}.
 *
 * @param options - Parent node, renderer data, and optional box settings.
 * @returns A handle for the created element, updates, and cleanup.
 *
 * @throws `RangeError`
 * Propagates validation errors from {@link renderProgressBar}.
 *
 * @example
 *
 * ```ts
 * import blessed from 'blessed';
 * import { progressBar } from 'blessed-components/progress-bar/blessed';
 *
 * const screen = blessed.screen({ smartCSR: true });
 * const upload = progressBar({
 *   parent: screen,
 *   box: {
 *     top: 0,
 *     left: 0,
 *     width: 40,
 *     height: 1,
 *   },
 *   data: {
 *     label: 'Uploaded',
 *     value: 25,
 *     width: 20,
 *   },
 * });
 *
 * screen.render();
 *
 * upload.setData({
 *   label: 'Uploaded',
 *   value: 75,
 *   width: 20,
 * });
 * screen.render();
 *
 * upload.destroy();
 * screen.destroy();
 * ```
 */
export function progressBar({ box, data, parent }: ProgressBarOptions): ProgressBarHandle {
  const element = blessed.box({
    ...box,
    content: renderProgressBar(data),
    parent,
    tags: false,
  });

  return {
    element,
    destroy() {
      element.destroy();
    },
    setData(nextData) {
      element.setContent(renderProgressBar(nextData));
    },
  };
}
