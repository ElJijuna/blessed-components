import type blessed from 'blessed';

import {
  renderTabList,
  type TabListCharacters,
  type TabListItem,
} from '@/components/navigation/tab-list/index.js';
import { createHorizontalSelection } from './internal/horizontal-selection.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the TabList adapter. */
export type TabListBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link tabList} adapter. */
export interface TabListData<TItem extends TabListItem = TabListItem> {
  /** Preferred initial focus identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: TabListCharacters;

  /** Initial active trigger for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no triggers exist. */
  emptyText?: string;

  /** Ordered triggers. Disabled triggers are visible but not interactive. */
  items: readonly TItem[];

  /** Called when Enter, Space, or {@link TabListHandle.activateFocused} requests activation. */
  onActivate?: (value: string) => void;

  /** Called after focus moves to a different enabled trigger. */
  onActiveIdChange?: (activeId: string) => void;

  /** Text inserted between rendered triggers. */
  separator?: string;

  /** Controlled active trigger identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link tabList} adapter. */
export interface TabListOptions<TItem extends TabListItem = TabListItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: TabListBoxOptions;

  /** Triggers, controlled or uncontrolled value, and change listeners. */
  data: TabListData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link tabList}. */
export interface TabListHandle<TItem extends TabListItem = TabListItem>
  extends BlessedComponentHandle<TabListData<TItem>, blessed.Widgets.BoxElement> {
  /** Activates the focused trigger or emits a controlled activation request. */
  activateFocused(): string | undefined;

  /** Returns the currently focused trigger identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves focus to an enabled trigger identifier. */
  focusItem(id: string): string | undefined;

  /** Moves focus to the first enabled trigger. */
  first(): string | undefined;

  /** Moves focus to the last enabled trigger. */
  last(): string | undefined;

  /** Moves focus to the next enabled trigger, wrapping at the end. */
  next(): string | undefined;

  /** Moves focus to the previous enabled trigger, wrapping at the start. */
  previous(): string | undefined;

  /** Returns the current controlled or uncontrolled active trigger identifier. */
  value(): string | undefined;
}

/** Creates an interactive horizontal TabList backed by a Blessed box. */
export function tabList<TItem extends TabListItem>({
  box,
  data: initialData,
  parent,
}: TabListOptions<TItem>): TabListHandle<TItem> {
  const controller = createHorizontalSelection<TItem, TabListData<TItem>>({
    ...(box === undefined ? {} : { box }),
    data: initialData,
    onActivate: (data, value) => data.onActivate?.(value),
    parent,
    render: ({ activeId, data, value, width }) =>
      renderTabList({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        ...(activeId === undefined ? {} : { focusedId: activeId }),
        items: data.items,
        ...(data.separator === undefined ? {} : { separator: data.separator }),
        ...(value === undefined ? {} : { activeId: value }),
        width,
      }),
  });

  return controller;
}
