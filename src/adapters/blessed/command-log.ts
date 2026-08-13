import blessed from 'blessed';

import {
  COMMAND_LOG_ASCII_CHARACTERS,
  COMMAND_LOG_UNICODE_CHARACTERS,
  type CommandLogCharacters,
  type CommandLogItem,
  renderCommandLog,
} from '@/components/developer-tools/command-log/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { BlessedComponentHandle } from './types.js';

export type CommandLogBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

export interface CommandLogData<TItem extends CommandLogItem = CommandLogItem> {
  activeId?: string;
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;
  characters?: CommandLogCharacters;
  items: readonly TItem[];
  newestFirst?: boolean;
  onActiveIdChange?: (id: string) => void;
  onRetry?: (item: TItem) => void;
}

export interface CommandLogOptions<TItem extends CommandLogItem = CommandLogItem> {
  box?: CommandLogBoxOptions;
  data: CommandLogData<TItem>;
  parent: blessed.Widgets.Node;
}

export interface CommandLogHandle<TItem extends CommandLogItem = CommandLogItem>
  extends BlessedComponentHandle<CommandLogData<TItem>, blessed.Widgets.BoxElement> {
  activeId(): string | undefined;
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

/** Creates an interactive CommandLog backed by a Blessed box. */
export function commandLog<TItem extends CommandLogItem>({
  box,
  data: initialData,
  parent,
}: CommandLogOptions<TItem>): CommandLogHandle<TItem> {
  let data = initialData;
  let active = data.activeId ?? data.items[0]?.id;

  const element = blessed.box({
    height: 5,
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
      renderCommandLog({
        ...(active === undefined ? {} : { activeId: active }),
        characters:
          data.characters ??
          (capabilities.unicode ? COMMAND_LOG_UNICODE_CHARACTERS : COMMAND_LOG_ASCII_CHARACTERS),
        height: Math.max(0, dimension(element.height) - dimension(element.iheight)),
        items: data.items,
        ...(data.newestFirst === undefined ? {} : { newestFirst: data.newestFirst }),
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
      return select(undefined);
    }

    const index = items.findIndex(({ id }) => id === active);
    const nextIndex = index < 0 ? 0 : (index + offset + items.length) % items.length;

    return select(items[nextIndex]?.id);
  };

  render();
  const handle: CommandLogHandle<TItem> = {
    activeId: () => active,
    destroy: () => element.destroy(),
    element,
    first: () => select(ordered()[0]?.id),
    focus: () => element.focus(),
    focusItem: select,
    last: () => select(ordered().at(-1)?.id),
    next: () => move(1),
    previous: () => move(-1),
    retryActive() {
      const item = data.items.find(({ id, retryable }) => id === active && retryable === true);

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
      case 'enter':
      case 'space':
        handle.retryActive();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
