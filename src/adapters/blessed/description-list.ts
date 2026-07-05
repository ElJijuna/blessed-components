import blessed from 'blessed';

import {
  type RenderDescriptionListOptions,
  renderDescriptionList,
} from '@/components/data-display/description-list/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by the DescriptionList adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link descriptionList}.
 */
export type DescriptionListBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link descriptionList} adapter. */
export interface DescriptionListData
  extends RenderDescriptionListOptions,
    Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link descriptionList} adapter. */
export interface DescriptionListOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: DescriptionListBoxOptions;

  /** Data passed to the pure {@link renderDescriptionList} renderer. */
  data: DescriptionListData;

  /** Blessed screen or node that receives the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link descriptionList}. */
export type DescriptionListHandle = BlessedComponentHandle<
  DescriptionListData,
  blessed.Widgets.BoxElement
>;

/**
 * Creates a display-only DescriptionList backed by a Blessed `BoxElement`.
 *
 * The adapter uses the shared Box theme contract, disables Blessed tags, and
 * never calls `screen.render()`.
 */
export function descriptionList({
  box,
  data: initialData,
  parent,
}: DescriptionListOptions): DescriptionListHandle {
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
    element.setContent(renderDescriptionList(renderData));
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
