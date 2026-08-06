import type blessed from 'blessed';

import {
  renderTabs,
  type TabItem,
  type TabsCharacters,
} from '@/components/navigation/tabs/index.js';
import { createHorizontalSelection } from './internal/horizontal-selection.js';
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

/** Creates interactive horizontal Tabs backed by a Blessed box. */
export function tabs<TItem extends TabItem>({
  box,
  data: initialData,
  parent,
}: TabsOptions<TItem>): TabsHandle<TItem> {
  const controller = createHorizontalSelection<TItem, TabsData<TItem>>({
    ...(box === undefined ? {} : { box }),
    data: initialData,
    onActivate: (data, value) => data.onValueChange?.(value),
    parent,
    render: ({ activeId, data, value, width }) =>
      renderTabs({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        ...(activeId === undefined ? {} : { focusedId: activeId }),
        items: data.items,
        ...(data.separator === undefined ? {} : { separator: data.separator }),
        ...(value === undefined ? {} : { activeId: value }),
        width,
      }),
  });

  return {
    ...controller,
    focusTab: controller.focusItem,
    selectActive: controller.activateFocused,
  };
}
