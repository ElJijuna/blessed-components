import blessed from 'blessed';

import {
  type RenderMultiSparklineOptions,
  renderMultiSparkline,
} from '@/components/visualization/multi-sparkline/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the MultiSparkline adapter. */
export type MultiSparklineBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link multiSparkline} adapter. */
export interface MultiSparklineData
  extends RenderMultiSparklineOptions,
    Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link multiSparkline} adapter. */
export interface MultiSparklineOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: MultiSparklineBoxOptions;

  /** Data passed to the pure {@link renderMultiSparkline} renderer. */
  data: MultiSparklineData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link multiSparkline}. */
export type MultiSparklineHandle = BlessedComponentHandle<
  MultiSparklineData,
  blessed.Widgets.BoxElement
>;

/** Creates display-only MultiSparkline backed by a Blessed `BoxElement`. */
export function multiSparkline({
  box,
  data: initialData,
  parent,
}: MultiSparklineOptions): MultiSparklineHandle {
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
    element.setContent(renderMultiSparkline(renderData));
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
