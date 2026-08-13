import blessed from 'blessed';
import {
  COMMAND_CENTER_ASCII_CHARACTERS,
  COMMAND_CENTER_UNICODE_CHARACTERS,
  type CommandCenterItem,
  filterCommandCenterItems,
  renderCommandCenter,
} from '@/components/navigation/command-center/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import type { BlessedComponentHandle } from './types.js';
export type CommandCenterBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export interface CommandCenterData<TItem extends CommandCenterItem = CommandCenterItem> {
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;
  items: readonly TItem[];
  onExecute?: (item: TItem) => void;
  onQueryChange?: (query: string) => void;
  query?: string;
  recentIds?: readonly string[];
}
export interface CommandCenterOptions<TItem extends CommandCenterItem = CommandCenterItem> {
  box?: CommandCenterBoxOptions;
  data: CommandCenterData<TItem>;
  parent: blessed.Widgets.Node;
}
export interface CommandCenterHandle<TItem extends CommandCenterItem = CommandCenterItem>
  extends BlessedComponentHandle<CommandCenterData<TItem>, blessed.Widgets.BoxElement> {
  activeId(): string | undefined;
  clearQuery(): string;
  executeActive(): TItem | undefined;
  first(): string | undefined;
  focus(): void;
  last(): string | undefined;
  next(): string | undefined;
  previous(): string | undefined;
  query(): string;
  setQuery(query: string): string;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function printable(value: string | undefined): value is string {
  return value !== undefined && value.length === 1 && value >= ' ' && value !== '\u007f';
}

/** Creates an interactive searchable CommandCenter. */
export function commandCenter<TItem extends CommandCenterItem>({
  box,
  data: initialData,
  parent,
}: CommandCenterOptions<TItem>): CommandCenterHandle<TItem> {
  let data = initialData;
  let uncontrolledQuery = data.query ?? '';
  let active: string | undefined;
  let scope = createFocusScope({ items: data.items });

  const element = blessed.box({
    border: 'line',
    keys: true,
    mouse: true,
    scrollable: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const controlled = () => Object.hasOwn(data, 'query');
  const current = () => (controlled() ? (data.query ?? '') : uncontrolledQuery);
  const filtered = () => filterCommandCenterItems(data.items, current());
  const rebuild = (preferred = active) => {
    scope = createFocusScope({ items: filtered() });
    scope.activate();
    active =
      preferred === undefined ? scope.current() : (scope.focus(preferred) ?? scope.current());
  };
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderCommandCenter({
        ...(active === undefined ? {} : { activeId: active }),
        characters: capabilities.unicode
          ? COMMAND_CENTER_UNICODE_CHARACTERS
          : COMMAND_CENTER_ASCII_CHARACTERS,
        height: Math.max(0, dimension(element.height) - dimension(element.iheight)),
        items: data.items,
        query: current(),
        ...(data.recentIds === undefined ? {} : { recentIds: data.recentIds }),
        width: Math.max(0, dimension(element.width) - dimension(element.iwidth)),
      }),
    );
  };
  const move = (id: string | undefined) => {
    active = id;
    render();

    return active;
  };
  const setQuery = (query: string) => {
    if (!controlled()) {
      uncontrolledQuery = query;
    }

    data.onQueryChange?.(query);
    rebuild();
    render();

    return current();
  };

  rebuild();
  render();
  const handle: CommandCenterHandle<TItem> = {
    activeId: () => active,
    clearQuery: () => setQuery(''),
    destroy: () => element.destroy(),
    element,
    executeActive() {
      const item = data.items.find(({ disabled, id }) => id === active && disabled !== true);

      if (item) {
        data.onExecute?.(item);
      }

      return item;
    },
    first: () => move(filtered().find(({ disabled }) => disabled !== true)?.id),
    focus: () => element.focus(),
    last: () => move([...filtered()].reverse().find(({ disabled }) => disabled !== true)?.id),
    next: () => move(scope.next()),
    previous: () => move(scope.previous()),
    query: current,
    setData(nextData) {
      const previous = current();

      data = nextData;

      if (!controlled()) {
        uncontrolledQuery = nextData.query ?? previous;
      }

      rebuild();
      render();
    },
    setQuery,
  };

  element.on('keypress', (character: string, key: { full?: string; name?: string }) => {
    switch (key.full ?? key.name) {
      case 'up':
        handle.previous();
        break;
      case 'down':
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
        handle.executeActive();
        break;
      case 'backspace':
        setQuery(current().slice(0, -1));
        break;
      case 'C-u':
        setQuery('');
        break;

      default:
        if (printable(character)) {
          setQuery(`${current()}${character}`);
        }
    }
  });
  element.on('resize', render);

  return handle;
}
