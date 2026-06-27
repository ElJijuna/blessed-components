import blessed from 'blessed';

import { type RenderLegendOptions, renderLegend } from '@/components/visualization/legend/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Legend adapter. */
export type LegendBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link legend} adapter. */
export interface LegendData extends RenderLegendOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link legend} adapter. */
export interface LegendOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: LegendBoxOptions;

  /** Data passed to the pure {@link renderLegend} renderer. */
  data: LegendData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link legend}. */
export type LegendHandle = BlessedComponentHandle<LegendData, blessed.Widgets.BoxElement>;

/**
 * Creates a display-only Legend backed by a Blessed `BoxElement`.
 *
 * The adapter disables Blessed tags, updates the existing element through
 * `setData`, and leaves `screen.render()` under application control.
 */
export function legend({ box, data: initialData, parent }: LegendOptions): LegendHandle {
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
    element.setContent(renderLegend(renderData));
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
