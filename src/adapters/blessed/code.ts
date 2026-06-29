import blessed from 'blessed';

import { type RenderCodeOptions, renderCode } from '@/components/data-display/code/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Code adapter. */
export type CodeBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link code} adapter. */
export interface CodeData extends RenderCodeOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link code} adapter. */
export interface CodeOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: CodeBoxOptions;

  /** Code content, layout policy, theme, and semantic tone. */
  data: CodeData;

  /** Blessed screen or node receiving the Code. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link code}. */
export type CodeHandle = BlessedComponentHandle<CodeData, blessed.Widgets.BoxElement>;

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

/** Creates display-only Code backed by a Blessed box. */
export function code({ box, data: initialData, parent }: CodeOptions): CodeHandle {
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
      renderCode({
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
