import blessed from 'blessed';

import {
  type RenderBreadcrumbOptions,
  renderBreadcrumb,
} from '@/components/data-display/breadcrumb/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Breadcrumb adapter. */
export type BreadcrumbBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link breadcrumb} adapter. */
export interface BreadcrumbData extends RenderBreadcrumbOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'muted'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link breadcrumb} adapter. */
export interface BreadcrumbOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: BreadcrumbBoxOptions;

  /** Path segments, layout policy, theme, and semantic tone. */
  data: BreadcrumbData;

  /** Blessed screen or node receiving the Breadcrumb. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link breadcrumb}. */
export type BreadcrumbHandle = BlessedComponentHandle<BreadcrumbData, blessed.Widgets.BoxElement>;

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
 * Creates display-only breadcrumb text backed by a Blessed box.
 *
 * The adapter derives missing renderer dimensions from the element's inner
 * size, applies the muted foreground token by default, disables Blessed tags,
 * and leaves `screen.render()` batching to callers.
 */
export function breadcrumb({
  box,
  data: initialData,
  parent,
}: BreadcrumbOptions): BreadcrumbHandle {
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
      renderBreadcrumb({
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
