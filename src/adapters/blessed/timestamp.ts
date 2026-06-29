import blessed from 'blessed';

import {
  type RenderTimestampOptions,
  renderTimestamp,
} from '@/components/data-display/timestamp/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Timestamp adapter. */
export type TimestampBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link timestamp} adapter. */
export interface TimestampData extends RenderTimestampOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'muted'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link timestamp} adapter. */
export interface TimestampOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: TimestampBoxOptions;

  /** Date value, formatting policy, layout policy, theme, and semantic tone. */
  data: TimestampData;

  /** Blessed screen or node receiving the Timestamp. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link timestamp}. */
export type TimestampHandle = BlessedComponentHandle<TimestampData, blessed.Widgets.BoxElement>;

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
 * Creates display-only timestamp text backed by a Blessed box.
 *
 * The adapter derives missing renderer dimensions from the element's inner
 * size, applies the muted foreground token by default, disables Blessed tags,
 * and leaves `screen.render()` batching to callers.
 */
export function timestamp({ box, data: initialData, parent }: TimestampOptions): TimestampHandle {
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
      foregroundTone: tone ?? 'muted',
      theme,
    });

    if (width === 0 || height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderTimestamp({
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
