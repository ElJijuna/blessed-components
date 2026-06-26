import blessed from 'blessed';

import { type RenderKbdOptions, renderKbd } from '@/components/data-display/kbd/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Kbd adapter. */
export type KbdBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link kbd} adapter. */
export interface KbdData extends RenderKbdOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link kbd} adapter. */
export interface KbdOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: KbdBoxOptions;

  /** Shortcut keys, layout policy, theme, and semantic tone. */
  data: KbdData;

  /** Blessed screen or node receiving the Kbd. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link kbd}. */
export type KbdHandle = BlessedComponentHandle<KbdData, blessed.Widgets.BoxElement>;

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
 * Creates a display-only Kbd backed by a Blessed box.
 *
 * The adapter derives missing width from the element's inner size, applies
 * semantic foreground color, disables Blessed tags, and leaves
 * `screen.render()` batching to callers.
 */
export function kbd({ box, data: initialData, parent }: KbdOptions): KbdHandle {
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
      foregroundTone: tone ?? 'foreground',
      theme,
    });

    if (width === 0 || height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderKbd({
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
