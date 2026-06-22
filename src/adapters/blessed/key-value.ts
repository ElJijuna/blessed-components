import blessed from 'blessed';

import {
  type RenderKeyValueOptions,
  renderKeyValue,
} from '@/components/data-display/key-value/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by the KeyValue adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link keyValue}.
 */
export type KeyValueBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link keyValue} adapter. */
export interface KeyValueData extends RenderKeyValueOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link keyValue} adapter. */
export interface KeyValueOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: KeyValueBoxOptions;

  /** Data passed to the pure {@link renderKeyValue} renderer. */
  data: KeyValueData;

  /** Blessed screen or node that receives the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link keyValue}. */
export type KeyValueHandle = BlessedComponentHandle<KeyValueData, blessed.Widgets.BoxElement>;

/**
 * Creates a display-only KeyValue backed by a Blessed `BoxElement`.
 *
 * The adapter uses the shared Box theme contract, disables Blessed tags, and
 * never calls `screen.render()`.
 */
export function keyValue({ box, data: initialData, parent }: KeyValueOptions): KeyValueHandle {
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
    element.setContent(renderKeyValue(renderData));
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
