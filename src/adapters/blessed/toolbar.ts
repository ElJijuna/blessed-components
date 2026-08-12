import blessed from 'blessed';

import {
  renderToolbarModel,
  TOOLBAR_ASCII_CHARACTERS,
  TOOLBAR_UNICODE_CHARACTERS,
  type ToolbarCharacters,
  type ToolbarItem,
} from '@/components/navigation/toolbar/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import type { BlessedComponentHandle } from './types.js';

export type ToolbarBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export interface ToolbarData<TItem extends ToolbarItem = ToolbarItem> {
  activeId?: string;
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;
  characters?: ToolbarCharacters;
  dense?: boolean;
  items: readonly TItem[];
  onAction?: (item: TItem) => void;
  onActiveIdChange?: (id: string) => void;
  width?: number;
}
export interface ToolbarOptions<TItem extends ToolbarItem = ToolbarItem> {
  box?: ToolbarBoxOptions;
  data: ToolbarData<TItem>;
  parent: blessed.Widgets.Node;
}
export interface ToolbarHandle<TItem extends ToolbarItem = ToolbarItem>
  extends BlessedComponentHandle<ToolbarData<TItem>, blessed.Widgets.BoxElement> {
  activateActive(): TItem | undefined;
  activeId(): string | undefined;
  first(): string | undefined;
  focus(): void;
  focusItem(id: string): string | undefined;
  last(): string | undefined;
  next(): string | undefined;
  previous(): string | undefined;
}
interface Keypress {
  full?: string;
  name?: string;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive Toolbar backed by a Blessed box. */
export function toolbar<TItem extends ToolbarItem>({
  box,
  data: initialData,
  parent,
}: ToolbarOptions<TItem>): ToolbarHandle<TItem> {
  let data = initialData;
  let active = data.activeId;
  let scope = createFocusScope({ items: data.items });

  const element = blessed.box({
    height: 1,
    keys: true,
    mouse: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const width = () =>
    data.width ?? Math.max(0, dimension(element.width) - dimension(element.iwidth));
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderToolbarModel({
        ...data,
        ...(active === undefined ? {} : { activeId: active }),
        characters:
          data.characters ??
          (capabilities.unicode ? TOOLBAR_UNICODE_CHARACTERS : TOOLBAR_ASCII_CHARACTERS),
        width: width(),
      }).content,
    );
  };
  const setActive = (id: string | undefined) => {
    if (id !== undefined && id !== active) {
      active = id;
      data.onActiveIdChange?.(id);
      render();
    }

    return active;
  };
  const enabledAt = (last = false) =>
    (last ? [...data.items].reverse() : data.items).find(({ disabled }) => !disabled)?.id;

  scope.activate();
  active = scope.focus(active ?? '') ?? scope.current();
  render();

  const handle: ToolbarHandle<TItem> = {
    activateActive() {
      const item = data.items.find(({ disabled, id }) => id === active && !disabled);

      if (item !== undefined) {
        data.onAction?.(item);
      }

      return item;
    },
    activeId: () => active,
    destroy: () => element.destroy(),
    element,
    first: () => setActive(enabledAt()),
    focus: () => element.focus(),
    focusItem: (id) => setActive(scope.focus(id)),
    last: () => setActive(enabledAt(true)),
    next: () => setActive(scope.next()),
    previous: () => setActive(scope.previous()),
    setData(nextData) {
      const previous = active;

      data = nextData;
      scope = createFocusScope({
        ...(data.activeId === undefined ? {} : { initialFocusId: data.activeId }),
        items: data.items,
      });
      scope.activate();
      active =
        data.activeId === undefined && previous !== undefined
          ? (scope.focus(previous) ?? scope.current())
          : scope.current();
      render();
    },
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'left':
      case 'shift-tab':
        handle.previous();
        break;
      case 'right':
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
        handle.activateActive();
        break;
    }
  });
  element.on('click', () => handle.activateActive());
  element.on('resize', render);

  return handle;
}
