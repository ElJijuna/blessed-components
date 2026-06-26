import blessed from 'blessed';

import {
  PROGRESS_STACK_ASCII_CHARACTERS,
  PROGRESS_STACK_UNICODE_CHARACTERS,
  type RenderProgressStackOptions,
  renderProgressStack,
} from '@/components/feedback/progress-stack/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the ProgressStack adapter. */
export type ProgressStackBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link progressStack} adapter. */
export interface ProgressStackData
  extends Omit<RenderProgressStackOptions, 'characters'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom segment characters. */
  characters?: RenderProgressStackOptions['characters'];

  /**
   * Semantic foreground token.
   *
   * @defaultValue `'foreground'`
   */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link progressStack} adapter. */
export interface ProgressStackOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: ProgressStackBoxOptions;

  /** Segment data, layout, capabilities, and theme data. */
  data: ProgressStackData;

  /** Blessed screen or node receiving the ProgressStack. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link progressStack}. */
export type ProgressStackHandle = BlessedComponentHandle<
  ProgressStackData,
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
 * Creates a display-only ProgressStack backed by a Blessed box.
 *
 * The adapter derives missing height from the element, chooses ASCII segment
 * characters when Unicode is unavailable, and leaves screen rendering under
 * caller control.
 */
export function progressStack({
  box,
  data: initialData,
  parent,
}: ProgressStackOptions): ProgressStackHandle {
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
    const height = data.height ?? innerDimension(element.height, element.iheight);
    const characters =
      data.characters ??
      (capabilities.unicode ? PROGRESS_STACK_UNICODE_CHARACTERS : PROGRESS_STACK_ASCII_CHARACTERS);

    element.setContent(
      renderProgressStack({
        ...data,
        characters,
        ...(height === undefined ? {} : { height }),
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
