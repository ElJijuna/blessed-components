import blessed from 'blessed';

import {
  type RenderProgressListOptions,
  renderProgressList,
} from '@/components/feedback/progress-list/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the ProgressList adapter. */
export type ProgressListBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link progressList} adapter. */
export interface ProgressListData
  extends Omit<RenderProgressListOptions, 'characters'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom track characters. */
  characters?: RenderProgressListOptions['characters'];

  /**
   * Semantic foreground token.
   *
   * @defaultValue `'foreground'`
   */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link progressList} adapter. */
export interface ProgressListOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: ProgressListBoxOptions;

  /** Progress rows, layout, capabilities, and theme data. */
  data: ProgressListData;

  /** Blessed screen or node receiving the ProgressList. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link progressList}. */
export type ProgressListHandle = BlessedComponentHandle<
  ProgressListData,
  blessed.Widgets.BoxElement
>;

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
 * Creates a display-only ProgressList backed by a Blessed box.
 *
 * The adapter derives missing renderer dimensions from the element's inner
 * size, chooses ASCII track characters when Unicode is unavailable, and leaves
 * screen rendering under caller control.
 */
export function progressList({
  box,
  data: initialData,
  parent,
}: ProgressListOptions): ProgressListHandle {
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
    const { backgroundTone, borderTone, capabilities: configuredCapabilities, theme, tone } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const width = data.width ?? innerDimension(element.width, element.iwidth);
    const height = data.height ?? innerDimension(element.height, element.iheight);
    const characters =
      data.characters ??
      (capabilities.unicode ? { empty: '░', filled: '█' } : { empty: '-', filled: '#' });

    element.setContent(
      renderProgressList({
        ...data,
        characters,
        ...(height === undefined ? {} : { height }),
        ...(width === undefined || width === 0 ? {} : { width }),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: tone,
      theme,
    });
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
