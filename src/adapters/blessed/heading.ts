import blessed from 'blessed';

import {
  type HeadingLevel,
  type RenderHeadingOptions,
  renderHeading,
} from '@/components/data-display/heading/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Heading adapter. */
export type HeadingBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link heading} adapter. */
export interface HeadingData extends RenderHeadingOptions, Omit<BoxData, 'foregroundTone'> {
  /** Whether Blessed should draw the heading in bold. Defaults to `true` for levels 1 and 2. */
  bold?: boolean;

  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link heading} adapter. */
export interface HeadingOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: HeadingBoxOptions;

  /** Heading content, level, layout policy, theme, and semantic tone. */
  data: HeadingData;

  /** Blessed screen or node receiving the Heading. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link heading}. */
export type HeadingHandle = BlessedComponentHandle<HeadingData, blessed.Widgets.BoxElement>;

function defaultBold(level: HeadingLevel | undefined): boolean {
  return level === undefined || level <= 2;
}

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
 * Creates a display-only Heading backed by a Blessed box.
 *
 * The adapter derives a missing width from the element's inner size, applies
 * semantic foreground color, disables Blessed tags, and leaves
 * `screen.render()` batching to callers.
 */
export function heading({ box, data: initialData, parent }: HeadingOptions): HeadingHandle {
  let data = initialData;

  const explicitBold = box?.style?.bold;
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
    const { backgroundTone, bold, borderTone, capabilities, theme, tone, ...renderData } = data;
    const width = renderData.width ?? innerDimension(element.width, element.iwidth);
    const height = innerDimension(element.height, element.iheight);

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone,
      theme,
    });
    element.style.bold = explicitBold ?? bold ?? defaultBold(renderData.level);

    if (width === 0 || height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderHeading({
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
