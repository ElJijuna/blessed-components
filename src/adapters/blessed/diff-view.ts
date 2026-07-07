import blessed from 'blessed';

import {
  type DiffViewCharacters,
  type DiffViewLine,
  renderDiffView,
} from '@/components/collections/diff-view/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the DiffView adapter. */
export type DiffViewBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link diffView} adapter. */
export interface DiffViewData {
  /** Character tokens for row state. */
  characters?: DiffViewCharacters;

  /** Text displayed when no diff lines exist. */
  emptyText?: string;

  /** Line number column width. Defaults to the widest visible line number. */
  lineNumberWidth?: number;

  /** Structured diff rows. */
  lines: readonly DiffViewLine[];

  /** Called when visual offset changes. */
  onOffsetChange?: (offset: number) => void;

  /** Rows retained between page operations. @defaultValue `1` */
  pageOverlap?: number;

  /** Whether to include old and new line number columns. @defaultValue `true` */
  showLineNumbers?: boolean;
}

/** Options accepted by the Blessed {@link diffView} adapter. */
export interface DiffViewOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: DiffViewBoxOptions;

  /** Lines, rendering, and callback configuration. */
  data: DiffViewData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link diffView}. */
export interface DiffViewHandle
  extends BlessedComponentHandle<DiffViewData, blessed.Widgets.BoxElement> {
  /** Gives terminal focus to the diff viewport. */
  focus(): void;

  /** Moves to offset zero. */
  home(): number;

  /** Returns current visual offset. */
  offset(): number;

  /** Scrolls backward by one row. */
  lineBackward(): number;

  /** Scrolls forward by one row. */
  lineForward(): number;

  /** Scrolls backward by one page. */
  pageBackward(): number;

  /** Scrolls forward by one page. */
  pageForward(): number;

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

/** Creates a scrollable DiffView backed by a Blessed box. */
export function diffView({ box, data: initialData, parent }: DiffViewOptions): DiffViewHandle {
  let data = initialData;
  let offset = 0;

  const element = blessed.box({
    keys: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const createModel = () =>
    createScrollArea({
      contentSize: data.lines.length,
      offset,
      ...(data.pageOverlap === undefined ? {} : { pageOverlap: data.pageOverlap }),
      viewportSize: viewportSize().height,
    });
  const render = (): void => {
    const size = viewportSize();

    offset = createModel().scrollTo(offset);
    element.setContent(
      renderDiffView({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: size.height,
        ...(data.lineNumberWidth === undefined ? {} : { lineNumberWidth: data.lineNumberWidth }),
        lines: data.lines,
        offset,
        ...(data.showLineNumbers === undefined ? {} : { showLineNumbers: data.showLineNumbers }),
        width: size.width,
      }),
    );
  };
  const scroll = (operation: (model: ReturnType<typeof createModel>) => number): number => {
    const previousOffset = offset;

    offset = operation(createModel());

    if (offset !== previousOffset) {
      data.onOffsetChange?.(offset);
    }

    render();

    return offset;
  };
  const handle: DiffViewHandle = {
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      element.focus();
    },
    home() {
      return scroll((model) => model.home());
    },
    lineBackward() {
      return scroll((model) => model.lineBackward());
    },
    lineForward() {
      return scroll((model) => model.lineForward());
    },
    offset() {
      return offset;
    },
    pageBackward() {
      return scroll((model) => model.pageBackward());
    },
    pageForward() {
      return scroll((model) => model.pageForward());
    },
    scrollTo(nextOffset) {
      return scroll((model) => model.scrollTo(nextOffset));
    },
    setData(nextData) {
      data = nextData;
      render();
    },
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
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
        handle.scrollTo(data.lines.length);
        break;
    }
  });
  element.on('resize', render);
  render();

  return handle;
}
