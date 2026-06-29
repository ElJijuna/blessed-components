import blessed from 'blessed';

import {
  measurePreformatted,
  type RenderPreformattedOptions,
  renderPreformatted,
} from '@/components/data-display/preformatted/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Preformatted adapter. */
export type PreformattedBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link preformatted} adapter. */
export interface PreformattedData
  extends RenderPreformattedOptions,
    Omit<BoxData, 'foregroundTone'> {
  /** Called when horizontal or vertical offsets change. */
  onOffsetChange?: (offsets: { horizontalOffset: number; verticalOffset: number }) => void;

  /** Rows retained between page operations. @defaultValue `1` */
  pageOverlap?: number;

  /** Semantic foreground token. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link preformatted} adapter. */
export interface PreformattedOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: PreformattedBoxOptions;

  /** Content, viewport policy, theme, and semantic tone. */
  data: PreformattedData;

  /** Blessed screen or node receiving the Preformatted block. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link preformatted}. */
export interface PreformattedHandle
  extends BlessedComponentHandle<PreformattedData, blessed.Widgets.BoxElement> {
  /** Moves the horizontal viewport left by one cell. */
  columnBackward(): { horizontalOffset: number; verticalOffset: number };

  /** Moves the horizontal viewport right by one cell. */
  columnForward(): { horizontalOffset: number; verticalOffset: number };

  /** Gives terminal focus to the block. */
  focus(): void;

  /** Moves both viewport offsets to zero. */
  home(): { horizontalOffset: number; verticalOffset: number };

  /** Moves the vertical viewport up by one row. */
  lineBackward(): { horizontalOffset: number; verticalOffset: number };

  /** Moves the vertical viewport down by one row. */
  lineForward(): { horizontalOffset: number; verticalOffset: number };

  /** Returns current viewport offsets. */
  offsets(): { horizontalOffset: number; verticalOffset: number };

  /** Moves the vertical viewport backward by one page. */
  pageBackward(): { horizontalOffset: number; verticalOffset: number };

  /** Moves the vertical viewport forward by one page. */
  pageForward(): { horizontalOffset: number; verticalOffset: number };

  /** Moves to absolute viewport offsets. */
  scrollTo(offsets: { horizontalOffset?: number; verticalOffset?: number }): {
    horizontalOffset: number;
    verticalOffset: number;
  };
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function clamp(value: number, max: number): number {
  return Math.min(Math.max(0, Math.floor(value)), max);
}

/** Creates scrollable Preformatted text backed by a Blessed box. */
export function preformatted({
  box,
  data: initialData,
  parent,
}: PreformattedOptions): PreformattedHandle {
  let data = initialData;
  let horizontalOffset = data.horizontalOffset ?? 0;
  let verticalOffset = data.verticalOffset ?? 0;

  const element = blessed.box({
    keys: true,
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
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const maxOffsets = (): { horizontalOffset: number; verticalOffset: number } => {
    const size = viewportSize();
    const metrics = measurePreformatted(data.content);

    return {
      horizontalOffset: Math.max(0, metrics.maxLineWidth - size.width),
      verticalOffset: Math.max(0, metrics.lineCount - size.height),
    };
  };
  const currentOffsets = (): { horizontalOffset: number; verticalOffset: number } => ({
    horizontalOffset: data.horizontalOffset ?? horizontalOffset,
    verticalOffset: data.verticalOffset ?? verticalOffset,
  });
  const render = (): void => {
    const { backgroundTone, borderTone, capabilities, theme, tone, ...renderData } = data;
    const size = viewportSize();
    const max = maxOffsets();
    const offsets = currentOffsets();

    horizontalOffset = clamp(offsets.horizontalOffset, max.horizontalOffset);
    verticalOffset = clamp(offsets.verticalOffset, max.verticalOffset);

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone ?? 'foreground',
      theme,
    });

    if (size.width === 0 || size.height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderPreformatted({
        ...renderData,
        height: size.height,
        horizontalOffset,
        verticalOffset,
        width: size.width,
      }),
    );
  };
  const moveTo = ({
    horizontalOffset: nextHorizontalOffset = horizontalOffset,
    verticalOffset: nextVerticalOffset = verticalOffset,
  }: {
    horizontalOffset?: number;
    verticalOffset?: number;
  }): { horizontalOffset: number; verticalOffset: number } => {
    const previousHorizontalOffset = horizontalOffset;
    const previousVerticalOffset = verticalOffset;
    const max = maxOffsets();

    horizontalOffset = clamp(nextHorizontalOffset, max.horizontalOffset);
    verticalOffset = clamp(nextVerticalOffset, max.verticalOffset);

    if (
      horizontalOffset !== previousHorizontalOffset ||
      verticalOffset !== previousVerticalOffset
    ) {
      data.onOffsetChange?.({ horizontalOffset, verticalOffset });
    }

    render();

    return { horizontalOffset, verticalOffset };
  };
  const pageSize = (): number => Math.max(1, viewportSize().height - (data.pageOverlap ?? 1));
  const handle: PreformattedHandle = {
    columnBackward() {
      return moveTo({ horizontalOffset: horizontalOffset - 1 });
    },
    columnForward() {
      return moveTo({ horizontalOffset: horizontalOffset + 1 });
    },
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      element.focus();
    },
    home() {
      return moveTo({ horizontalOffset: 0, verticalOffset: 0 });
    },
    lineBackward() {
      return moveTo({ verticalOffset: verticalOffset - 1 });
    },
    lineForward() {
      return moveTo({ verticalOffset: verticalOffset + 1 });
    },
    offsets() {
      return currentOffsets();
    },
    pageBackward() {
      return moveTo({ verticalOffset: verticalOffset - pageSize() });
    },
    pageForward() {
      return moveTo({ verticalOffset: verticalOffset + pageSize() });
    },
    scrollTo(offsets) {
      return moveTo(offsets);
    },
    setData(nextData) {
      data = nextData;
      horizontalOffset = data.horizontalOffset ?? horizontalOffset;
      verticalOffset = data.verticalOffset ?? verticalOffset;
      render();
    },
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'left':
      case 'h':
        handle.columnBackward();
        break;
      case 'right':
      case 'l':
        handle.columnForward();
        break;
      case 'up':
      case 'k':
        handle.lineBackward();
        break;
      case 'down':
      case 'j':
        handle.lineForward();
        break;
      case 'pageup':
        handle.pageBackward();
        break;
      case 'pagedown':
        handle.pageForward();
        break;
      case 'home':
        handle.home();
        break;
      case 'end':
        handle.scrollTo(maxOffsets());
        break;
    }
  });
  element.on('resize', render);
  render();

  return handle;
}
