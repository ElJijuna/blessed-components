import blessed from 'blessed';

import {
  renderScrollAreaScrollbar,
  type ScrollAreaCharacters,
} from '@/components/layout/scroll-area/index.js';
import { createScrollArea, type ScrollAreaMetrics } from '@/primitives/scroll-area/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the ScrollArea adapter. */
export type ScrollAreaBoxOptions = Omit<
  BoxElementOptions,
  'content' | 'keys' | 'mouse' | 'scrollable' | 'tags'
>;

/** Stateful content, offset, keyboard, and theme data accepted by ScrollArea. */
export interface ScrollAreaData extends BoxData {
  /** Scrollbar track and thumb characters. */
  characters?: ScrollAreaCharacters;

  /** Total content height in rows. */
  contentHeight: number;

  /** Initial offset for uncontrolled usage. */
  defaultOffset?: number;

  /** Scrollbar characters used while the root owns focus. */
  focusedCharacters?: ScrollAreaCharacters;

  /** Called when user or imperative input requests a new offset. */
  onOffsetChange?: (offset: number) => void;

  /**
   * Controlled vertical offset.
   *
   * Visual state changes only after a new value reaches `setData()`.
   */
  offset?: number;

  /** Rows retained between page operations. @defaultValue `1` */
  pageOverlap?: number;

  /** Whether one stable column is reserved for the scrollbar. @defaultValue `true` */
  showScrollbar?: boolean;

  /** Semantic foreground token for the scrollbar. @defaultValue `'muted'` */
  scrollbarTone?: BoxData['foregroundTone'];
}

/** Options accepted by the Blessed {@link scrollArea} adapter. */
export interface ScrollAreaOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: ScrollAreaBoxOptions;

  /** Content size, controlled or uncontrolled offset, and semantic theme. */
  data: ScrollAreaData;

  /** Blessed screen or node receiving the visible container. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link scrollArea}. */
export interface ScrollAreaHandle
  extends BlessedComponentHandle<ScrollAreaData, blessed.Widgets.BoxElement> {
  /** Inner translated element receiving caller-owned children. */
  readonly contentElement: blessed.Widgets.BoxElement;

  /** Visible scrollbar element. */
  readonly scrollbarElement: blessed.Widgets.BoxElement;

  /** Moves to maximum offset. */
  end(): number;

  /** Gives terminal focus to the scrollable root. */
  focus(): void;

  /** Moves to offset zero. */
  home(): number;

  /** Moves backward by one or more rows. */
  lineBackward(amount?: number): number;

  /** Moves forward by one or more rows. */
  lineForward(amount?: number): number;

  /** Returns current headless scrollbar metrics. */
  metrics(): ScrollAreaMetrics;

  /** Returns current visual offset. */
  offset(): number;

  /** Moves backward by one page. */
  pageBackward(): number;

  /** Moves forward by one page. */
  pageForward(): number;

  /** Re-measures available dimensions. */
  resize(): ScrollAreaMetrics;

  /** Moves to an absolute offset. */
  scrollTo(offset: number): number;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/**
 * Creates a keyboard and mouse accessible vertical ScrollArea.
 *
 * Add children to `contentElement` using content-row coordinates. The root
 * clips translated content and reserves a stable right column for scrollbar
 * feedback by default.
 */
export function scrollArea({
  box: elementOptions,
  data: initialData,
  parent,
}: ScrollAreaOptions): ScrollAreaHandle {
  let data = initialData;
  let destroyed = false;
  let focused = false;

  const element = blessed.box({
    ...elementOptions,
    content: '',
    parent,
    scrollable: true,
    style: {
      ...elementOptions?.style,
      border: { ...elementOptions?.style?.border },
    },
    tags: false,
  });
  const innerSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const isControlled = (): boolean => Object.hasOwn(data, 'offset');
  const createModel = (offset: number | undefined) =>
    createScrollArea({
      contentSize: data.contentHeight,
      ...(offset === undefined ? {} : { offset }),
      ...(data.pageOverlap === undefined ? {} : { pageOverlap: data.pageOverlap }),
      viewportSize: innerSize().height,
    });

  let model = createModel(data.offset ?? data.defaultOffset);

  const initialSize = innerSize();
  const contentElement = blessed.box({
    content: '',
    height: data.contentHeight,
    left: 0,
    parent: element,
    tags: false,
    top: 0,
    width: Math.max(0, initialSize.width - 1),
  });
  const scrollbarElement = blessed.box({
    content: '',
    height: initialSize.height,
    parent: element,
    right: 0,
    tags: false,
    top: 0,
    width: 1,
  });
  const style = createBoxStyleController(element, elementOptions);
  const scrollbarStyle = createBoxStyleController(scrollbarElement);
  const render = (): ScrollAreaMetrics => {
    if (destroyed) {
      return model.metrics();
    }

    const size = innerSize();
    const showScrollbar = data.showScrollbar !== false;

    model.setSizes({
      contentSize: data.contentHeight,
      viewportSize: size.height,
    });

    if (isControlled()) {
      model.scrollTo(data.offset ?? 0);
    }

    const metrics = model.metrics();

    style.apply(data);
    scrollbarStyle.apply({
      capabilities: data.capabilities,
      foregroundTone: data.scrollbarTone ?? 'muted',
      theme: data.theme,
    });
    contentElement.top = -metrics.offset;
    contentElement.left = 0;
    contentElement.height = data.contentHeight;
    contentElement.width = Math.max(0, size.width - (showScrollbar ? 1 : 0));
    scrollbarElement.hidden = !showScrollbar;
    scrollbarElement.height = size.height;
    scrollbarElement.setContent(
      showScrollbar
        ? renderScrollAreaScrollbar({
            ...metrics,
            characters: focused
              ? (data.focusedCharacters ?? { thumb: '█', track: '┃' })
              : (data.characters ?? { thumb: '█', track: '│' }),
          })
        : '',
    );

    return metrics;
  };
  const request = (operation: () => number): number => {
    const previousOffset = model.metrics().offset;
    const requestedOffset = operation();

    if (requestedOffset !== previousOffset) {
      data.onOffsetChange?.(requestedOffset);
    }

    if (isControlled()) {
      model.scrollTo(previousOffset);
    }

    return render().offset;
  };
  const handle: ScrollAreaHandle = {
    contentElement,
    destroy() {
      destroyed = true;
      element.destroy();
    },
    element,
    end: () => request(model.end),
    focus() {
      element.focus();
    },
    home: () => request(model.home),
    lineBackward: (amount) => request(() => model.lineBackward(amount)),
    lineForward: (amount) => request(() => model.lineForward(amount)),
    metrics: () => model.metrics(),
    offset: () => model.metrics().offset,
    pageBackward: () => request(model.pageBackward),
    pageForward: () => request(model.pageForward),
    resize: render,
    scrollbarElement,
    scrollTo: (offset) => request(() => model.scrollTo(offset)),
    setData(nextData) {
      const previousOffset = model.metrics().offset;
      const previousPageOverlap = data.pageOverlap;

      data = nextData;

      if (data.pageOverlap !== previousPageOverlap) {
        model = createModel(data.offset ?? previousOffset);
      }

      render();
    },
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'down':
        handle.lineForward();
        break;
      case 'end':
        handle.end();
        break;
      case 'home':
        handle.home();
        break;
      case 'pagedown':
        handle.pageForward();
        break;
      case 'pageup':
        handle.pageBackward();
        break;
      case 'up':
        handle.lineBackward();
        break;
    }
  });
  element.on('blur', () => {
    if (destroyed) {
      return;
    }

    focused = false;
    render();
  });
  element.on('focus', () => {
    if (destroyed) {
      return;
    }

    focused = true;
    render();
  });
  element.on('resize', render);
  element.on('wheeldown', () => {
    handle.lineForward();
  });
  element.on('wheelup', () => {
    handle.lineBackward();
  });
  element.enableInput();
  render();

  return handle;
}
