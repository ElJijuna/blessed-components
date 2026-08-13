import blessed from 'blessed';
import {
  filterWorkspaceSwitcherItems,
  renderWorkspaceSwitcher,
  WORKSPACE_SWITCHER_ASCII_CHARACTERS,
  WORKSPACE_SWITCHER_UNICODE_CHARACTERS,
  type WorkspaceSwitcherItem,
} from '@/components/navigation/workspace-switcher/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import type { BlessedComponentHandle } from './types.js';

export type WorkspaceSwitcherBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export interface WorkspaceSwitcherData<
  TItem extends WorkspaceSwitcherItem = WorkspaceSwitcherItem,
> {
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;
  defaultValue?: string;
  items: readonly TItem[];
  onQueryChange?: (query: string) => void;
  onValueChange?: (value: string) => void;
  query?: string;
  value?: string;
}
export interface WorkspaceSwitcherOptions<
  TItem extends WorkspaceSwitcherItem = WorkspaceSwitcherItem,
> {
  box?: WorkspaceSwitcherBoxOptions;
  data: WorkspaceSwitcherData<TItem>;
  parent: blessed.Widgets.Node;
}
export interface WorkspaceSwitcherHandle<
  TItem extends WorkspaceSwitcherItem = WorkspaceSwitcherItem,
> extends BlessedComponentHandle<WorkspaceSwitcherData<TItem>, blessed.Widgets.BoxElement> {
  activeId(): string | undefined;
  clearQuery(): string;
  first(): string | undefined;
  focus(): void;
  last(): string | undefined;
  next(): string | undefined;
  previous(): string | undefined;
  query(): string;
  selectActive(): string | undefined;
  setQuery(query: string): string;
  value(): string | undefined;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function printable(value: string | undefined): value is string {
  return value !== undefined && value.length === 1 && value >= ' ' && value !== '\u007f';
}

/** Creates an interactive searchable WorkspaceSwitcher. */
export function workspaceSwitcher<TItem extends WorkspaceSwitcherItem>({
  box,
  data: initialData,
  parent,
}: WorkspaceSwitcherOptions<TItem>): WorkspaceSwitcherHandle<TItem> {
  let data = initialData;
  let uncontrolledValue = data.defaultValue;
  let uncontrolledQuery = data.query ?? '';
  let active: string | undefined;
  let scope = createFocusScope({ items: data.items });

  const element = blessed.box({
    keys: true,
    mouse: true,
    scrollable: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const valueControlled = () => Object.hasOwn(data, 'value');
  const queryControlled = () => Object.hasOwn(data, 'query');
  const currentValue = () => (valueControlled() ? data.value : uncontrolledValue);
  const currentQuery = () => (queryControlled() ? (data.query ?? '') : uncontrolledQuery);
  const filtered = () => filterWorkspaceSwitcherItems(data.items, currentQuery());
  const rebuild = (preferred = active) => {
    scope = createFocusScope({ items: filtered() });
    scope.activate();
    active =
      preferred === undefined ? scope.current() : (scope.focus(preferred) ?? scope.current());
  };
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderWorkspaceSwitcher({
        ...(active === undefined ? {} : { activeId: active }),
        characters: capabilities.unicode
          ? WORKSPACE_SWITCHER_UNICODE_CHARACTERS
          : WORKSPACE_SWITCHER_ASCII_CHARACTERS,
        height: Math.max(0, dimension(element.height) - dimension(element.iheight)),
        items: data.items,
        query: currentQuery(),
        ...(currentValue() === undefined ? {} : { value: currentValue() }),
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
    if (!queryControlled()) {
      uncontrolledQuery = query;
    }

    data.onQueryChange?.(query);
    rebuild();
    render();

    return currentQuery();
  };

  rebuild(currentValue());
  render();
  const handle: WorkspaceSwitcherHandle<TItem> = {
    activeId: () => active,
    clearQuery: () => setQuery(''),
    destroy: () => element.destroy(),
    element,
    first: () => move(filtered().find(({ disabled }) => disabled !== true)?.id),
    focus: () => element.focus(),
    last: () => move([...filtered()].reverse().find(({ disabled }) => disabled !== true)?.id),
    next: () => move(scope.next()),
    previous: () => move(scope.previous()),
    query: currentQuery,
    selectActive() {
      const item = data.items.find(({ disabled, id }) => id === active && disabled !== true);

      if (item === undefined) {
        return undefined;
      }

      if (!valueControlled()) {
        uncontrolledValue = item.id;
      }

      data.onValueChange?.(item.id);
      render();

      return item.id;
    },
    setData(nextData) {
      const previousQuery = currentQuery();
      const previousValue = currentValue();

      data = nextData;

      if (!queryControlled()) {
        uncontrolledQuery = nextData.query ?? previousQuery;
      }

      if (!valueControlled()) {
        uncontrolledValue = nextData.defaultValue ?? previousValue;
      }

      rebuild(currentValue());
      render();
    },
    setQuery,
    value: currentValue,
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
        handle.selectActive();
        break;
      case 'backspace':
        setQuery(currentQuery().slice(0, -1));
        break;
      case 'C-u':
        setQuery('');
        break;

      default:
        if (printable(character)) {
          setQuery(`${currentQuery()}${character}`);
        }
    }
  });
  element.on('resize', render);

  return handle;
}
