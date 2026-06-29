import blessed from 'blessed';

import { type RenderTagOptions, renderTag } from '@/components/data-display/tag/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Tag adapter. */
export type TagBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link tag} adapter. */
export interface TagData extends RenderTagOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'primary'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link tag} adapter. */
export interface TagOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: TagBoxOptions;

  /** Tag label, visual policy, layout policy, theme, and semantic tone. */
  data: TagData;

  /** Blessed screen or node receiving the Tag. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link tag}. */
export type TagHandle = BlessedComponentHandle<TagData, blessed.Widgets.BoxElement>;

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
 * Creates display-only tag text backed by a Blessed box.
 *
 * The adapter derives missing renderer dimensions from the element's inner
 * size, applies the primary foreground token by default, disables Blessed tags,
 * and leaves `screen.render()` batching to callers.
 */
export function tag({ box, data: initialData, parent }: TagOptions): TagHandle {
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
    const width = renderData.width ?? innerDimension(element.width, element.iwidth) ?? 0;
    const height = renderData.height ?? innerDimension(element.height, element.iheight);

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone ?? 'primary',
      theme,
    });

    if (width === 0 || height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderTag({
        ...renderData,
        ...(height === undefined ? {} : { height }),
        width,
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
