import blessed from 'blessed';

import {
  type RenderTerminalPaneOptions,
  renderTerminalPane,
  type TerminalPaneLine,
  type TerminalPaneStatus,
} from '@/components/terminal/terminal-pane/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the TerminalPane adapter. */
export type TerminalPaneBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link terminalPane} adapter. */
export interface TerminalPaneData extends RenderTerminalPaneOptions {
  /** Whether to follow appended output. @defaultValue `true` */
  follow?: boolean;

  /** Called when output lines change. */
  onLinesChange?: (lines: readonly TerminalPaneLine[]) => void;

  /** Called when visual offset changes. */
  onOffsetChange?: (offset: number) => void;

  /** Rows retained between page operations. @defaultValue `1` */
  pageOverlap?: number;
}

/** Options accepted by the Blessed {@link terminalPane} adapter. */
export interface TerminalPaneOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: TerminalPaneBoxOptions;

  /** Output, status, rendering, and callback configuration. */
  data?: TerminalPaneData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link terminalPane}. */
export interface TerminalPaneHandle
  extends BlessedComponentHandle<TerminalPaneData, blessed.Widgets.BoxElement> {
  /** Appends one output line. */
  append(line: TerminalPaneLine): readonly TerminalPaneLine[];

  /** Appends multiple output lines. */
  appendMany(lines: readonly TerminalPaneLine[]): readonly TerminalPaneLine[];

  /** Clears retained output lines. */
  clear(): void;

  /** Gives terminal focus to the viewport. */
  focus(): void;

  /** Moves to offset zero. */
  home(): number;

  /** Scrolls backward by one row. */
  lineBackward(): number;

  /** Scrolls forward by one row. */
  lineForward(): number;

  /** Returns retained output lines. */
  lines(): readonly TerminalPaneLine[];

  /** Scrolls backward by one page. */
  pageBackward(): number;

  /** Scrolls forward by one page. */
  pageForward(): number;

  /** Moves to an absolute offset. */
  scrollTo(offset: number): number;

  /** Updates status metadata without changing output lines. */
  setStatus(status: TerminalPaneStatus, exitCode?: number): void;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a scrollable, display-only terminal session pane backed by a Blessed box. */
export function terminalPane({
  box,
  data: initialData = {},
  parent,
}: TerminalPaneOptions): TerminalPaneHandle {
  let data = initialData;
  let lines = [...(initialData.lines ?? [])];
  let offset = initialData.offset ?? 0;

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
  const bodyViewportHeight = (): number =>
    Math.max(0, viewportSize().height - (data.showHeader === false ? 0 : 1));
  const createModel = () =>
    createScrollArea({
      contentSize: lines.length === 0 ? 1 : lines.length,
      offset,
      ...(data.pageOverlap === undefined ? {} : { pageOverlap: data.pageOverlap }),
      viewportSize: bodyViewportHeight(),
    });
  const render = (): void => {
    const size = viewportSize();
    const model = createModel();

    offset = data.follow === false ? model.scrollTo(offset) : model.end();

    element.setContent(
      renderTerminalPane({
        ...(data.command === undefined ? {} : { command: data.command }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        ...(data.exitCode === undefined ? {} : { exitCode: data.exitCode }),
        height: size.height,
        lines,
        offset,
        ...(data.showHeader === undefined ? {} : { showHeader: data.showHeader }),
        ...(data.status === undefined ? {} : { status: data.status }),
        width: size.width,
      }),
    );
  };
  const notifyLines = (): readonly TerminalPaneLine[] => {
    data.onLinesChange?.(lines);

    return lines;
  };
  const scroll = (operation: (model: ReturnType<typeof createModel>) => number): number => {
    const previousOffset = offset;
    const model = createModel();

    offset = operation(model);

    if (offset !== previousOffset) {
      data.onOffsetChange?.(offset);
    }

    render();

    return offset;
  };
  const handle: TerminalPaneHandle = {
    append(line) {
      return this.appendMany([line]);
    },
    appendMany(nextLines) {
      lines = [...lines, ...nextLines];
      render();

      return notifyLines();
    },
    clear() {
      lines = [];
      offset = 0;
      render();
      notifyLines();
    },
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
    lines() {
      return lines;
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
      lines = [...(nextData.lines ?? [])];
      offset = nextData.offset ?? 0;
      render();
      notifyLines();
    },
    setStatus(status, exitCode) {
      data =
        exitCode === undefined
          ? { ...data, status }
          : {
              ...data,
              exitCode,
              status,
            };
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
        handle.scrollTo(lines.length);
        break;
    }
  });

  render();

  return handle;
}
