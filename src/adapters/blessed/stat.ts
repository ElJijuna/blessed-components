import blessed from 'blessed';

import { type RenderStatOptions, renderStat } from '@/components/data-display/stat/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by the Stat adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link stat}.
 */
export type StatBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link stat} adapter. */
export interface StatData extends RenderStatOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link stat} adapter. */
export interface StatOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: StatBoxOptions;

  /** Data passed to the pure {@link renderStat} renderer. */
  data: StatData;

  /** Blessed screen or node that receives the created box. */
  parent: blessed.Widgets.Node;
}

/**
 * Imperative handle returned by {@link stat}.
 *
 * The handle owns one box. It does not own the parent screen and never calls
 * `screen.render()`.
 */
export type StatHandle = BlessedComponentHandle<StatData, blessed.Widgets.BoxElement>;

/**
 * Creates a display-only Stat backed by a Blessed `BoxElement`.
 *
 * Import from `blessed-components/stat/blessed`. The adapter disables Blessed
 * tags, renders content through {@link renderStat}, and leaves terminal
 * rendering under caller control.
 *
 * @param options - Parent node, renderer data, and optional box settings.
 * @returns Handle for the created box, updates, and cleanup.
 *
 * @throws `RangeError`
 * Propagates validation errors from {@link renderStat}.
 *
 * @example
 *
 * ```ts
 * import blessed from 'blessed';
 * import { stat } from 'blessed-components/stat/blessed';
 *
 * const screen = blessed.screen({ smartCSR: true });
 * const revenue = stat({
 *   parent: screen,
 *   box: { top: 0, left: 0, width: 40, height: 3 },
 *   data: {
 *     label: 'Revenue',
 *     value: '$84K',
 *     trend: {
 *       direction: 'up',
 *       value: '12.5%',
 *     },
 *   },
 * });
 *
 * screen.render();
 * revenue.setData({
 *   label: 'Revenue',
 *   value: '$91K',
 * });
 * screen.render();
 *
 * revenue.destroy();
 * screen.destroy();
 * ```
 */
export function stat({ box, data: initialData, parent }: StatOptions): StatHandle {
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
    element.setContent(renderStat(renderData));
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
