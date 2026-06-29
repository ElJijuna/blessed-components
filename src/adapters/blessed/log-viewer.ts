import blessed from 'blessed';

import {
  type CreateLogViewerStateOptions,
  createLogViewerState,
  type LogEntry,
  type LogViewerCharacters,
  renderLogViewer,
} from '@/components/collections/log-viewer/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the LogViewer adapter. */
export type LogViewerBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link logViewer} adapter. */
export interface LogViewerData extends CreateLogViewerStateOptions {
  /** Character tokens for row structure and level state. */
  characters?: LogViewerCharacters;

  /** Text displayed when no entries exist. */
  emptyText?: string;

  /** Called when visible entries change after append, resume, clear, or setData. */
  onEntriesChange?: (entries: readonly LogEntry[]) => void;

  /** Called when visual offset changes. */
  onOffsetChange?: (offset: number) => void;

  /** Called when pause state changes. */
  onPausedChange?: (paused: boolean) => void;

  /** Rows retained between page operations. @defaultValue `1` */
  pageOverlap?: number;

  /** Whether to include level markers. @defaultValue `true` */
  showLevel?: boolean;

  /** Whether to include source text. @defaultValue `true` */
  showSource?: boolean;

  /** Whether to include timestamps. @defaultValue `false` */
  showTimestamp?: boolean;
}

/** Options accepted by the Blessed {@link logViewer} adapter. */
export interface LogViewerOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: LogViewerBoxOptions;

  /** Entries, retention, rendering, and callback configuration. */
  data?: LogViewerData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link logViewer}. */
export interface LogViewerHandle
  extends BlessedComponentHandle<LogViewerData, blessed.Widgets.BoxElement> {
  /** Appends one log entry. */
  append(entry: LogEntry): readonly LogEntry[];

  /** Appends multiple log entries. */
  appendMany(entries: readonly LogEntry[]): readonly LogEntry[];

  /** Clears visible and queued entries. */
  clear(): void;

  /** Returns retained visible entries. */
  entries(): readonly LogEntry[];

  /** Gives terminal focus to the log viewport. */
  focus(): void;

  /** Moves to offset zero. */
  home(): number;

  /** Returns whether appended entries are queued. */
  isPaused(): boolean;

  /** Scrolls backward by one row. */
  lineBackward(): number;

  /** Scrolls forward by one row. */
  lineForward(): number;

  /** Scrolls backward by one page. */
  pageBackward(): number;

  /** Scrolls forward by one page. */
  pageForward(): number;

  /** Starts queueing appended entries. */
  pause(): void;

  /** Returns queued entries not yet visible. */
  pendingEntries(): readonly LogEntry[];

  /** Flushes queued entries and resumes visible updates. */
  resume(): readonly LogEntry[];

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

/** Creates a scrollable, pausable LogViewer backed by a Blessed box. */
export function logViewer({
  box,
  data: initialData = {},
  parent,
}: LogViewerOptions): LogViewerHandle {
  let data = initialData;
  let offset = 0;

  const state = createLogViewerState(data);
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
      contentSize: state.entries().length,
      offset,
      ...(data.pageOverlap === undefined ? {} : { pageOverlap: data.pageOverlap }),
      viewportSize: viewportSize().height,
    });
  const render = (): void => {
    const size = viewportSize();
    const model = createModel();

    if (data.follow !== false && !state.isPaused()) {
      offset = model.end();
    } else {
      offset = model.scrollTo(offset);
    }

    element.setContent(
      renderLogViewer({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        entries: state.entries(),
        height: size.height,
        offset,
        ...(data.showLevel === undefined ? {} : { showLevel: data.showLevel }),
        ...(data.showSource === undefined ? {} : { showSource: data.showSource }),
        ...(data.showTimestamp === undefined ? {} : { showTimestamp: data.showTimestamp }),
        width: size.width,
      }),
    );
  };
  const notifyEntries = (): readonly LogEntry[] => {
    const entries = state.entries();

    data.onEntriesChange?.(entries);

    return entries;
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
  const handle: LogViewerHandle = {
    append(entry) {
      return this.appendMany([entry]);
    },
    appendMany(entries) {
      state.appendMany(entries);
      render();

      return notifyEntries();
    },
    clear() {
      state.clear();
      offset = 0;
      render();
      notifyEntries();
    },
    destroy() {
      element.destroy();
    },
    element,
    entries() {
      return state.entries();
    },
    focus() {
      element.focus();
    },
    home() {
      return scroll((model) => model.home());
    },
    isPaused() {
      return state.isPaused();
    },
    lineBackward() {
      return scroll((model) => model.lineBackward());
    },
    lineForward() {
      return scroll((model) => model.lineForward());
    },
    pageBackward() {
      return scroll((model) => model.pageBackward());
    },
    pageForward() {
      return scroll((model) => model.pageForward());
    },
    pause() {
      state.pause();
      data.onPausedChange?.(true);
      render();
    },
    pendingEntries() {
      return state.pendingEntries();
    },
    resume() {
      state.resume();
      data.onPausedChange?.(false);
      render();

      return notifyEntries();
    },
    scrollTo(nextOffset) {
      return scroll((model) => model.scrollTo(nextOffset));
    },
    setData(nextData) {
      data = nextData;
      state.setOptions(nextData);
      render();
      notifyEntries();
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
        handle.scrollTo(state.entries().length);
        break;
      case 'space':
        if (state.isPaused()) {
          handle.resume();
        } else {
          handle.pause();
        }

        break;
    }
  });
  element.on('resize', render);
  render();

  return handle;
}
