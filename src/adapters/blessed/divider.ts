import blessed from 'blessed';

import {
  type DividerCharacters,
  type RenderDividerOptions,
  renderDivider,
} from '../../components/layout/divider/index.js';
import { detectCapabilities, type TerminalCapabilities } from '../../core/capabilities.js';
import { createCharacterSet } from '../../core/characters.js';
import type { ThemeColors } from '../../core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Divider adapter. */
export type DividerBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link divider} adapter. */
export interface DividerData
  extends Omit<RenderDividerOptions, 'length'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Explicit length; otherwise derived from the element's inner size. */
  length?: number;

  /** Semantic foreground token. @defaultValue `'border'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link divider} adapter. */
export interface DividerOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: DividerBoxOptions;

  /** Orientation, label, characters, length, and theme data. */
  data?: DividerData;

  /** Blessed screen or node receiving the Divider. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link divider}. */
export type DividerHandle = BlessedComponentHandle<DividerData, blessed.Widgets.BoxElement>;

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/**
 * Creates a themed display-only Divider backed by a Blessed box.
 *
 * Missing length is derived from inner width for horizontal Dividers and inner
 * height for vertical Dividers. Unicode or ASCII defaults follow terminal
 * capabilities.
 */
export function divider({ box, data: initialData = {}, parent }: DividerOptions): DividerHandle {
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
  const style = createBoxStyleController(element, box, {
    foregroundTone: 'border',
  });
  const render = (): void => {
    const {
      backgroundTone,
      borderTone,
      capabilities: configuredCapabilities,
      characters: configuredCharacters,
      length: configuredLength,
      theme,
      tone,
      ...renderData
    } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const orientation = renderData.orientation ?? 'horizontal';
    const length =
      configuredLength ??
      (orientation === 'vertical'
        ? Math.max(0, numericDimension(element.height) - numericDimension(element.iheight))
        : Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)));
    const characters: DividerCharacters =
      configuredCharacters ?? createCharacterSet(capabilities.unicode ? 'unicode' : 'ascii').border;

    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: tone,
      theme,
    });
    element.setContent(
      length === 0
        ? ''
        : renderDivider({
            ...renderData,
            characters,
            length,
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
