import blessed from 'blessed';

import {
  renderTabs,
  type TabItem,
  type TabsCharacters,
} from '@/components/navigation/tabs/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Tabs adapter. */
export type TabsBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link tabs} adapter. */
export interface TabsData<TItem extends TabItem = TabItem> {
  /** Preferred initial focus identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: TabsCharacters;

  /** Initial active tab for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no tabs exist. */
  emptyText?: string;

  /** Ordered tabs. Disabled tabs are visible but not interactive. */
  items: readonly TItem[];

  /** Called after focus moves to a different enabled tab. */
  onActiveIdChange?: (activeId: string) => void;

  /** Called when Enter, Space, or {@link TabsHandle.selectActive} requests activation. */
  onValueChange?: (value: string) => void;

  /** Text inserted between rendered tabs. */
  separator?: string;

  /** Controlled active tab identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link tabs} adapter. */
export interface TabsOptions<TItem extends TabItem = TabItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: TabsBoxOptions;

  /** Tabs, controlled or uncontrolled value, and change listeners. */
  data: TabsData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link tabs}. */
export interface TabsHandle<TItem extends TabItem = TabItem>
  extends BlessedComponentHandle<TabsData<TItem>, blessed.Widgets.BoxElement> {
  /** Returns the currently focused tab identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves focus to an enabled tab identifier. */
  focusTab(id: string): string | undefined;

  /** Moves focus to the first enabled tab. */
  first(): string | undefined;

  /** Moves focus to the last enabled tab. */
  last(): string | undefined;

  /** Moves focus to the next enabled tab, wrapping at the end. */
  next(): string | undefined;

  /** Moves focus to the previous enabled tab, wrapping at the start. */
  previous(): string | undefined;

  /** Activates the focused tab or emits a controlled activation request. */
  selectActive(): string | undefined;

  /** Returns the current controlled or uncontrolled active tab identifier. */
  value(): string | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates interactive horizontal Tabs backed by a Blessed box. */
export function tabs<TItem extends TabItem>({
  box,
  data: initialData,
  parent,
}: TabsOptions<TItem>): TabsHandle<TItem> {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue;
  let currentActiveId = initialData.activeId;

  const element = blessed.box({
    keys: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const width = (): number =>
    Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const selectedValue = (): string | undefined => (isControlled() ? data.value : uncontrolledValue);
  const initialValue = selectedValue();

  let focusScope = createFocusScope({ items: data.items });
  let selection = createSelectionModel({
    defaultSelectedIds: initialValue === undefined ? [] : [initialValue],
    items: data.items,
  });

  const render = (): void => {
    const value = selectedValue();

    element.setContent(
      renderTabs({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        ...(currentActiveId === undefined ? {} : { focusedId: currentActiveId }),
        items: data.items,
        ...(data.separator === undefined ? {} : { separator: data.separator }),
        ...(value === undefined ? {} : { activeId: value }),
        width: width(),
      }),
    );
  };
  const setActive = (id: string | undefined): string | undefined => {
    if (id === undefined || id === currentActiveId) {
      return currentActiveId;
    }

    currentActiveId = id;
    data.onActiveIdChange?.(id);
    render();

    return currentActiveId;
  };
  const move = (direction: 'next' | 'previous'): string | undefined =>
    setActive(focusScope[direction]());
  const focusNearest = (index: number, direction: 'backward' | 'forward'): string | undefined => {
    const step = direction === 'forward' ? 1 : -1;

    for (
      let candidateIndex = index;
      candidateIndex >= 0 && candidateIndex < data.items.length;
      candidateIndex += step
    ) {
      const candidate = data.items[candidateIndex];

      if (candidate?.disabled !== true) {
        return candidate === undefined
          ? currentActiveId
          : setActive(focusScope.focus(candidate.id));
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
  };

  focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  render();

  const handle: TabsHandle<TItem> = {
    activeId: () => currentActiveId,
    destroy() {
      element.destroy();
    },
    element,
    first: () => focusNearest(0, 'forward'),
    focus() {
      element.focus();
    },
    focusTab: (id) => setActive(focusScope.focus(id)),
    last: () => focusNearest(data.items.length - 1, 'backward'),
    next: () => move('next'),
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
      case 'left':
        handle.previous();
        break;
      case 'right':
        handle.next();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
