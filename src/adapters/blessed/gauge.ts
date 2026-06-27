import blessed from 'blessed';

import { type RenderGaugeOptions, renderGauge } from '@/components/visualization/gauge/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Gauge adapter. */
export type GaugeBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link gauge} adapter. */
export interface GaugeData extends RenderGaugeOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link gauge} adapter. */
export interface GaugeOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: GaugeBoxOptions;

  /** Data passed to the pure {@link renderGauge} renderer. */
  data: GaugeData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link gauge}. */
export type GaugeHandle = BlessedComponentHandle<GaugeData, blessed.Widgets.BoxElement>;

/**
 * Creates a display-only Gauge backed by a Blessed `BoxElement`.
 *
 * The adapter disables Blessed tags, updates the existing element through
 * `setData`, and leaves `screen.render()` under application control.
 */
export function gauge({ box, data: initialData, parent }: GaugeOptions): GaugeHandle {
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
    element.setContent(renderGauge(renderData));
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
