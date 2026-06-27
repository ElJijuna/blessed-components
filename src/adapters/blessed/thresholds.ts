import blessed from 'blessed';

import {
  type RenderThresholdsOptions,
  renderThresholds,
} from '@/components/visualization/thresholds/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Thresholds adapter. */
export type ThresholdsBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link thresholds} adapter. */
export interface ThresholdsData extends RenderThresholdsOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link thresholds} adapter. */
export interface ThresholdsOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: ThresholdsBoxOptions;

  /** Data passed to the pure {@link renderThresholds} renderer. */
  data: ThresholdsData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link thresholds}. */
export type ThresholdsHandle = BlessedComponentHandle<ThresholdsData, blessed.Widgets.BoxElement>;

/**
 * Creates display-only Thresholds backed by a Blessed `BoxElement`.
 *
 * The adapter disables Blessed tags, updates content through `setData`, and
 * leaves screen rendering under caller control.
 */
export function thresholds({
  box,
  data: initialData,
  parent,
}: ThresholdsOptions): ThresholdsHandle {
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
    element.setContent(renderThresholds(renderData));
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
