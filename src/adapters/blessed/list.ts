import blessed from 'blessed';

import {
  type ListCharacters,
  type ListItem,
  renderList,
} from '@/components/collections/list/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by the List adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link list}. Keyboard input
 * is enabled by default and can still be disabled through `keys: false`.
 */
export type ListBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/**
 * Stateful data accepted by the Blessed {@link list} adapter.
 *
 * @typeParam TItem - List item shape, including application metadata.
 */
export interface ListData<TItem extends ListItem = ListItem> {
  /** Preferred initial cursor identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: ListCharacters;

  /**
   * Initial selection for uncontrolled usage.
   *
   * Ignored when `value` is supplied.
   */
  defaultValue?: string;

  /** Text displayed when no items exist. */
  emptyText?: string;

  /** Ordered items. Disabled items are visible but not interactive. */
  items: readonly TItem[];

  /** Called after the cursor moves to a different enabled item. */
  onActiveIdChange?: (activeId: string) => void;

  /** Called when Enter or {@link ListHandle.selectActive} requests selection. */
  onValueChange?: (value: string) => void;

  /**
   * Controlled selected identifier.
   *
   * When supplied, selection requests emit `onValueChange` but visual state
   * changes only after new data is passed to `setData`.
   */
  value?: string;
}

/**
 * Options accepted by the Blessed {@link list} adapter.
 *
 * @typeParam TItem - List item shape.
 */
export interface ListOptions<TItem extends ListItem = ListItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: ListBoxOptions;

  /** Items, controlled or uncontrolled value, and change listeners. */
  data: ListData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/**
 * Imperative handle returned by {@link list}.
 *
 * @typeParam TItem - List item shape.
 */
export interface ListHandle<TItem extends ListItem = ListItem>
  extends BlessedComponentHandle<ListData<TItem>, blessed.Widgets.BoxElement> {
  /** Returns the current enabled cursor identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves the cursor to an enabled identifier. */
  focusItem(id: string): string | undefined;

  /** Moves the cursor to the first enabled item. */
  first(): string | undefined;

  /** Moves the cursor to the last enabled item. */
  last(): string | undefined;

  /** Moves the cursor to the next enabled item, wrapping at the end. */
  next(): string | undefined;

  /** Moves the cursor one viewport page backward. */
  pageBackward(): string | undefined;

  /** Moves the cursor one viewport page forward. */
  pageForward(): string | undefined;

  /** Moves the cursor to the previous enabled item, wrapping at the start. */
  previous(): string | undefined;

  /** Selects the active item or emits a controlled selection request. */
  selectActive(): string | undefined;

  /** Returns the current controlled or uncontrolled selected identifier. */
  value(): string | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/**
 * Creates an interactive single-selection List backed by a Blessed box.
 *
 * The adapter composes collection identity through `FocusScope`, selection
 * through `Selection`, and viewport movement through `ScrollArea`. It supports
 * Arrow Up/Down, Home/End, Page Up/Down, Enter, and Space.
 *
 * The component never calls `screen.render()`. Applications retain control of
 * render batching after keyboard events, imperative operations, or `setData`.
 *
 * @typeParam TItem - List item shape.
 * @param options - Parent node, stateful data, and optional box settings.
 * @returns Handle for focus, movement, selection, updates, and cleanup.
 */
export function list<TItem extends ListItem>({
  box,
  data: initialData,
  parent,
}: ListOptions<TItem>): ListHandle<TItem> {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue;
  let currentActiveId = initialData.activeId;
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
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const selectedValue = (): string | undefined => (isControlled() ? data.value : uncontrolledValue);
  const initialValue = selectedValue();

  let focusScope = createFocusScope({ items: data.items });
  let selection = createSelectionModel({
    defaultSelectedIds: initialValue === undefined ? [] : [initialValue],
    items: data.items,
  });
  let scrollArea = createScrollArea({
    contentSize: data.items.length,
    viewportSize: viewportSize().height,
  });

  const render = (): void => {
    const dimensions = viewportSize();
    const value = selectedValue();

    scrollArea.setSizes({
      contentSize: data.items.length,
      viewportSize: dimensions.height,
    });
    offset = scrollArea.scrollTo(offset);
    element.setContent(
      renderList({
        ...(currentActiveId === undefined ? {} : { activeId: currentActiveId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: dimensions.height,
        items: data.items,
        offset,
        ...(value === undefined ? {} : { selectedId: value }),
        width: dimensions.width,
      }),
    );
  };
  const ensureActiveVisible = (): void => {
    const index = data.items.findIndex(({ id }) => id === currentActiveId);
    const { height } = viewportSize();

    if (index < 0 || height === 0) {
      return;
    }

    if (index < offset) {
      offset = scrollArea.scrollTo(index);
    } else if (index >= offset + height) {
      offset = scrollArea.scrollTo(index - height + 1);
    }
  };
  const setActive = (id: string | undefined): string | undefined => {
    if (id === undefined || id === currentActiveId) {
      return currentActiveId;
    }

    currentActiveId = id;
    ensureActiveVisible();
    data.onActiveIdChange?.(id);
    render();

    return currentActiveId;
  };
  const move = (direction: 'next' | 'previous'): string | undefined =>
    setActive(focusScope[direction]());
  const focusAtIndex = (index: number): string | undefined => {
    const item = data.items[index];

    return item === undefined ? currentActiveId : setActive(focusScope.focus(item.id));
  };
  const focusNearest = (index: number, direction: 'backward' | 'forward'): string | undefined => {
    const step = direction === 'forward' ? 1 : -1;

    for (
      let candidateIndex = index;
      candidateIndex >= 0 && candidateIndex < data.items.length;
      candidateIndex += step
    ) {
      const candidate = data.items[candidateIndex];

      if (candidate?.disabled !== true) {
        return focusAtIndex(candidateIndex);
      }
    }

    return currentActiveId;
  };
  const rebuildModels = (): void => {
    const previousActiveId = currentActiveId;

    focusScope = createFocusScope({
      ...(data.activeId === undefined ? {} : { initialFocusId: data.activeId }),
      items: data.items,
    });
    currentActiveId = focusScope.activate();

    if (
      data.activeId === undefined &&
      previousActiveId !== undefined &&
      data.items.some(({ disabled, id }) => id === previousActiveId && disabled !== true)
    ) {
      currentActiveId = focusScope.focus(previousActiveId);
    }

    const currentValue = selectedValue();

    selection = createSelectionModel({
      defaultSelectedIds: currentValue === undefined ? [] : [currentValue],
      items: data.items,
    });
    scrollArea = createScrollArea({
      contentSize: data.items.length,
      offset,
      viewportSize: viewportSize().height,
    });
    ensureActiveVisible();
  };

  focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  ensureActiveVisible();
  render();

  const handle: ListHandle<TItem> = {
    activeId: () => currentActiveId,
    destroy() {
      element.destroy();
    },
    element,
    first: () => focusNearest(0, 'forward'),
    focus() {
      element.focus();
    },
    focusItem: (id) => setActive(focusScope.focus(id)),
    last: () => focusNearest(data.items.length - 1, 'backward'),
    next: () => move('next'),
    pageBackward() {
      const nextOffset = scrollArea.pageBackward();

      return focusNearest(nextOffset, 'backward');
    },
    pageForward() {
      const nextOffset = scrollArea.pageForward();
      const index = Math.min(data.items.length - 1, nextOffset);

      return focusNearest(index, 'forward');
    },
    previous: () => move('previous'),
    selectActive() {
      if (currentActiveId === undefined) {
        return undefined;
      }

      if (isControlled()) {
        data.onValueChange?.(currentActiveId);

        return currentActiveId;
      }

      if (selection.select(currentActiveId)) {
        uncontrolledValue = currentActiveId;
        data.onValueChange?.(currentActiveId);
        render();
      }

      return currentActiveId;
    },
    setData(nextData) {
      data = nextData;

      if (isControlled()) {
        uncontrolledValue = undefined;
      } else if (
        uncontrolledValue !== undefined &&
        !data.items.some(({ disabled, id }) => id === uncontrolledValue && disabled !== true)
      ) {
        uncontrolledValue = data.defaultValue;
      }

      rebuildModels();
      render();
    },
    value: selectedValue,
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'down':
        handle.next();
        break;
      case 'end':
        handle.last();
        break;
      case 'enter':
      case 'space':
        handle.selectActive();
        break;
      case 'home':
        handle.first();
        break;
      case 'pagedown':
        handle.pageForward();
        break;
      case 'pageup':
        handle.pageBackward();
        break;
      case 'up':
        handle.previous();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
