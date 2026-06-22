import blessed from 'blessed';

import {
  type RenderProgressBarOptions,
  renderProgressBar,
} from '@/components/feedback/progress-bar/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

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

/** Stateful data accepted by the Blessed {@link progressBar} adapter. */
export interface ProgressBarData extends RenderProgressBarOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link progressBar} adapter. */
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
  data: ProgressBarData;

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
export type ProgressBarHandle = BlessedComponentHandle<ProgressBarData, blessed.Widgets.BoxElement>;

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
 * - updates the existing element through `setData`;
 * - leaves screen rendering under caller control;
 * - detaches its element through `destroy`.
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
export function progressBar({
  box,
  data: initialData,
  parent,
}: ProgressBarOptions): ProgressBarHandle {
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
    const { backgroundTone, borderTone, capabilities, theme, tone, ...renderData } = data;

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone,
      theme,
    });
    element.setContent(renderProgressBar(renderData));
  };

  render();

  return {
    element,
    destroy() {
      element.destroy();
    },
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
