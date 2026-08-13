import blessed from 'blessed';

import {
  JOB_QUEUE_ASCII_CHARACTERS,
  JOB_QUEUE_UNICODE_CHARACTERS,
  type JobQueueCharacters,
  type JobQueueItem,
  renderJobQueue,
} from '@/components/developer-tools/job-queue/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { BlessedComponentHandle } from './types.js';

export type JobQueueBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

export interface JobQueueData<TItem extends JobQueueItem = JobQueueItem> {
  activeId?: string;
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;
  characters?: JobQueueCharacters;
  items: readonly TItem[];
  newestFirst?: boolean;
  onActiveIdChange?: (id: string) => void;
  onCancel?: (item: TItem) => void;
  onRetry?: (item: TItem) => void;
  summary?: boolean;
}

export interface JobQueueOptions<TItem extends JobQueueItem = JobQueueItem> {
  box?: JobQueueBoxOptions;
  data: JobQueueData<TItem>;
  parent: blessed.Widgets.Node;
}

export interface JobQueueHandle<TItem extends JobQueueItem = JobQueueItem>
  extends BlessedComponentHandle<JobQueueData<TItem>, blessed.Widgets.BoxElement> {
  activeId(): string | undefined;
  cancelActive(): TItem | undefined;
  first(): string | undefined;
  focus(): void;
  focusItem(id: string): string | undefined;
  last(): string | undefined;
  next(): string | undefined;
  previous(): string | undefined;
  retryActive(): TItem | undefined;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive JobQueue backed by a Blessed box. */
export function jobQueue<TItem extends JobQueueItem>({
  box,
  data: initialData,
  parent,
}: JobQueueOptions<TItem>): JobQueueHandle<TItem> {
  let data = initialData;
  let active = data.activeId ?? data.items[0]?.id;

  const element = blessed.box({
    height: 6,
    keys: true,
    mouse: true,
    scrollable: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const ordered = () => (data.newestFirst ? [...data.items].reverse() : [...data.items]);
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderJobQueue({
        ...(active === undefined ? {} : { activeId: active }),
        characters:
          data.characters ??
          (capabilities.unicode ? JOB_QUEUE_UNICODE_CHARACTERS : JOB_QUEUE_ASCII_CHARACTERS),
        height: Math.max(0, dimension(element.height) - dimension(element.iheight)),
        items: data.items,
        ...(data.newestFirst === undefined ? {} : { newestFirst: data.newestFirst }),
        ...(data.summary === undefined ? {} : { summary: data.summary }),
        width: Math.max(0, dimension(element.width) - dimension(element.iwidth)),
      }),
    );
  };
  const select = (id: string | undefined) => {
    if (id !== undefined && id !== active && data.items.some((item) => item.id === id)) {
      active = id;
      data.onActiveIdChange?.(id);
      render();
    }

    return active;
  };
  const move = (offset: number) => {
    const items = ordered();

    if (items.length === 0) {
      return active;
    }

    const index = items.findIndex(({ id }) => id === active);

    return select(items[index < 0 ? 0 : (index + offset + items.length) % items.length]?.id);
  };
  const actionable = (action: 'cancellable' | 'retryable') =>
    data.items.find((item) => item.id === active && item[action] === true);

  render();
  const handle: JobQueueHandle<TItem> = {
    activeId: () => active,
    cancelActive() {
      const item = actionable('cancellable');

      if (item) {
        data.onCancel?.(item);
      }

      return item;
    },
    destroy: () => element.destroy(),
    element,
    first: () => select(ordered()[0]?.id),
    focus: () => element.focus(),
    focusItem: select,
    last: () => select(ordered().at(-1)?.id),
    next: () => move(1),
    previous: () => move(-1),
    retryActive() {
      const item = actionable('retryable');

      if (item) {
        data.onRetry?.(item);
      }

      return item;
    },
    setData(nextData) {
      data = nextData;
      active =
        data.activeId ?? (data.items.some(({ id }) => id === active) ? active : ordered()[0]?.id);
      render();
    },
  };

  element.on('keypress', (_character: string, key: { full?: string; name?: string }) => {
    switch (key.full ?? key.name) {
      case 'up':
      case 'shift-tab':
        handle.previous();
        break;
      case 'down':
      case 'tab':
        handle.next();
        break;
      case 'home':
        handle.first();
        break;
      case 'end':
        handle.last();
        break;
      case 'delete':
      case 'c':
        handle.cancelActive();
        break;
      case 'enter':
      case 'space':
      case 'r':
        handle.retryActive();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
