import blessed from 'blessed';

import { type RenderLabelOptions, renderLabel } from '@/components/data-display/label/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Label adapter. */
export type LabelBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link label} adapter. */
export interface LabelData extends RenderLabelOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'muted'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link label} adapter. */
export interface LabelOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: LabelBoxOptions;

  /** Label content, required marker, suffix, layout policy, theme, and tone. */
  data: LabelData;

  /** Blessed screen or node receiving the Label. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link label}. */
export type LabelHandle = BlessedComponentHandle<LabelData, blessed.Widgets.BoxElement>;

function numericDimension(value: blessed.Widgets.Types.TPosition): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined;
}

function innerDimension(
  outer: blessed.Widgets.Types.TPosition,
  inset: blessed.Widgets.Types.TPosition,
): number | undefined {
  const outerSize = numericDimension(outer);

  return outerSize === undefined
    ? undefined
    : Math.max(0, outerSize - (numericDimension(inset) ?? 0));
}

/**
 * Creates a display-only Label backed by a Blessed box.
 *
 * The adapter derives missing width from the element's inner size, applies a
 * muted semantic foreground by default, disables Blessed tags, and leaves
 * `screen.render()` batching to callers.
 */
export function label({ box, data: initialData, parent }: LabelOptions): LabelHandle {
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
    const width = renderData.width ?? innerDimension(element.width, element.iwidth);
    const height = innerDimension(element.height, element.iheight);

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone ?? 'muted',
      theme,
    });

    if (width === 0 || height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderLabel({
        ...renderData,
        ...(width === undefined ? {} : { width }),
      }),
    );
  };

  render();
  element.on('resize', render);

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
