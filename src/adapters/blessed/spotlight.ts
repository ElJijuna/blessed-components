import blessed from 'blessed';

import {
  type CreateSpotlightStateOptions,
  filterSpotlightItems,
  renderSpotlightStatus,
  type SpotlightItem,
} from '@/components/overlays/spotlight/index.js';
import type { Theme } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import { type DialogRootHandle, dialogRoot } from './dialog.js';
import { type MenuHandle, menu } from './menu.js';
import { type SearchFieldHandle, searchField } from './search-field.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by Spotlight parts. */
export type SpotlightBoxOptions = BoxElementOptions;

/** Stateful data accepted by {@link spotlight}. */
export interface SpotlightData<TItem extends SpotlightItem = SpotlightItem>
  extends BoxData,
    CreateSpotlightStateOptions {
  /** Whether choosing an action requests closing. @defaultValue `true` */
  closeOnAction?: boolean;

  /** Whether Escape requests closing. @defaultValue `true` */
  dismissOnEscape?: boolean;

  /** Text displayed when no results match. */
  emptyText?: string;

  /** Stable overlay identifier. */
  id: string;

  /** Ordered actions/resources. Disabled items are visible but not interactive. */
  items: readonly TItem[];

  /** Field label. @defaultValue `'Search'` */
  label?: string;

  /** Maximum returned results before viewport clipping. */
  limit?: number;

  /** Whether this Spotlight blocks lower overlay layers. @defaultValue `true` */
  modal?: boolean;

  /** Called when Enter, Space, click, or {@link SpotlightHandle.activateActive} chooses a result. */
  onAction?: (item: TItem) => void;

  /** Placeholder shown when query is empty. */
  placeholder?: string;

  /** Semantic terminal theme. */
  theme?: Theme;
}

/** Options accepted by {@link spotlight}. */
export interface SpotlightOptions<TItem extends SpotlightItem = SpotlightItem> {
  /** Full-screen layer position, style, and standard Blessed settings. */
  box?: SpotlightBoxOptions;

  /** Panel layout overrides. */
  content?: SpotlightBoxOptions;

  /** Search input layout overrides. */
  input?: SpotlightBoxOptions;

  /** Text, state, actions, and semantic theme configuration. */
  data: SpotlightData<TItem>;

  /** Results menu layout overrides. */
  results?: SpotlightBoxOptions;

  /** Blessed screen or node receiving the Spotlight layer. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link spotlight}. */
export interface SpotlightHandle<TItem extends SpotlightItem = SpotlightItem>
  extends BlessedComponentHandle<SpotlightData<TItem>, blessed.Widgets.BoxElement> {
  /** Current controlled or uncontrolled open state. */
  readonly isOpen: boolean;

  /** Activates the focused result. */
  activateActive(): TItem | undefined;

  /** Requests closing. */
  close(): boolean;

  /** Gives terminal focus to the search field when open. */
  focus(): void;

  /** Returns the current controlled or uncontrolled query. */
  query(): string;

  /** Requests opening. */
  open(): boolean;

  /** Returns current filtered results. */
  results(): readonly TItem[];

  /** Sets the query. */
  setQuery(query: string): string;

  /** Requests opposite open state. */
  toggle(): boolean;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a full-screen searchable action/resource overlay. */
export function spotlight<TItem extends SpotlightItem>({
  box,
  content,
  data: initialData,
  input,
  parent,
  results,
}: SpotlightOptions<TItem>): SpotlightHandle<TItem> {
  let data = initialData;
  let uncontrolledQuery = initialData.defaultQuery ?? '';
  let filteredItems = filterSpotlightItems({
    items: data.items,
    ...(data.limit === undefined ? {} : { limit: data.limit }),
    query: data.query ?? uncontrolledQuery,
  });

  const root = dialogRoot({
    ...(box === undefined ? {} : { box }),
    data: {
      ...(data.backgroundTone === undefined ? {} : { backgroundTone: data.backgroundTone }),
      ...(data.defaultOpen === undefined ? {} : { defaultOpen: data.defaultOpen }),
      ...(data.dismissOnEscape === undefined ? {} : { dismissOnEscape: data.dismissOnEscape }),
      id: data.id,
      initialFocusId: 'search',
      ...(data.modal === undefined ? {} : { modal: data.modal }),
      ...(data.onOpenChange === undefined ? {} : { onOpenChange: data.onOpenChange }),
      ...(data.open === undefined ? {} : { open: data.open }),
      ...(data.theme === undefined ? {} : { theme: data.theme }),
    },
    parent,
  });
  const panel = blessed.box({
    border: 'line',
    height: '70%',
    left: 'center',
    padding: { left: 1, right: 1 },
    top: 1,
    width: '80%',
    ...content,
    parent: root.element,
    style: {
      ...content?.style,
      border: { ...content?.style?.border },
    },
    tags: false,
  });
  const panelStyle = createBoxStyleController(panel, content, {
    backgroundTone: 'background',
    borderTone: 'border',
    ...(data.theme === undefined ? {} : { theme: data.theme }),
  });
  const status = blessed.box({
    bottom: 0,
    content: '',
    height: 1,
    left: 0,
    parent: panel,
    right: 0,
    tags: false,
  });
  const isQueryControlled = (): boolean => Object.hasOwn(data, 'query');
  const query = (): string => (isQueryControlled() ? (data.query ?? '') : uncontrolledQuery);
  const statusWidth = (): number =>
    Math.max(0, numericDimension(status.width) - numericDimension(status.iwidth));
  const updateStatus = (): void => {
    status.setContent(
      renderSpotlightStatus({
        count: filteredItems.length,
        query: query(),
        total: data.items.length,
        width: statusWidth(),
      }),
    );
  };
  const rootData = (): Parameters<DialogRootHandle['setData']>[0] => ({
    ...(data.backgroundTone === undefined ? {} : { backgroundTone: data.backgroundTone }),
    ...(data.defaultOpen === undefined ? {} : { defaultOpen: data.defaultOpen }),
    ...(data.dismissOnEscape === undefined ? {} : { dismissOnEscape: data.dismissOnEscape }),
    id: data.id,
    initialFocusId: 'search',
    ...(data.modal === undefined ? {} : { modal: data.modal }),
    ...(data.onOpenChange === undefined ? {} : { onOpenChange: data.onOpenChange }),
    ...(data.open === undefined ? {} : { open: data.open }),
    ...(data.theme === undefined ? {} : { theme: data.theme }),
  });
  const updateFiltered = (): void => {
    filteredItems = filterSpotlightItems({
      items: data.items,
      ...(data.limit === undefined ? {} : { limit: data.limit }),
      query: query(),
    });
  };
  const updateChildren = (): void => {
    updateFiltered();
    panelStyle.apply({
      backgroundTone: data.backgroundTone,
      borderTone: data.borderTone,
      capabilities: data.capabilities,
      theme: data.theme,
    });
    search.setData({
      label: data.label ?? 'Search',
      onQueryChange: handleQueryChange,
      onSubmit: () => handle.activateActive(),
      placeholder: data.placeholder ?? 'Search actions',
      query: query(),
    });
    resultMenu.setData({
      emptyText: data.emptyText ?? 'No results',
      items: filteredItems,
      onAction: handleAction,
    });
    updateStatus();
  };
  const handleQueryChange = (nextQuery: string): void => {
    if (!isQueryControlled()) {
      uncontrolledQuery = nextQuery;
    }

    data.onQueryChange?.(nextQuery);

    if (isQueryControlled()) {
      updateStatus();

      return;
    }

    updateChildren();
  };
  const handleAction = (item: TItem): void => {
    data.onAction?.(item);

    if (data.closeOnAction !== false) {
      root.close();
    }
  };
  const search: SearchFieldHandle = searchField({
    box: {
      height: 3,
      left: 0,
      right: 0,
      top: 0,
      ...input,
    },
    data: {
      label: data.label ?? 'Search',
      onQueryChange: handleQueryChange,
      onSubmit: () => handle.activateActive(),
      placeholder: data.placeholder ?? 'Search actions',
      query: data.query ?? uncontrolledQuery,
    },
    parent: panel,
  });
  const resultMenu: MenuHandle<TItem> = menu({
    box: {
      bottom: 1,
      left: 0,
      right: 0,
      top: 3,
      ...results,
    },
    data: {
      emptyText: data.emptyText ?? 'No results',
      items: filteredItems,
      onAction: handleAction,
    },
    parent: panel,
  });

  root.registerFocusable('search', search.element);
  root.registerFocusable('results', resultMenu.element);

  const handle: SpotlightHandle<TItem> = {
    activateActive: () => resultMenu.activateActive(),
    close: () => root.close(),
    destroy() {
      root.close();
      root.unregisterFocusable('results');
      root.unregisterFocusable('search');
      status.destroy();
      resultMenu.destroy();
      search.destroy();
      panel.destroy();
      root.destroy();
    },
    element: root.element,
    focus() {
      search.focus();
    },
    get isOpen() {
      return root.isOpen;
    },
    open: () => root.open(),
    query,
    results: () => filteredItems,
    setData(nextData) {
      const previousId = data.id;

      data = nextData;

      if (!isQueryControlled() && nextData.defaultQuery !== undefined) {
        uncontrolledQuery = nextData.defaultQuery;
      }

      if (root.isOpen && data.id !== previousId) {
        throw new RangeError('Open Spotlight id cannot change.');
      }

      root.setData(rootData());
      updateChildren();
    },
    setQuery(nextQuery) {
      search.setQuery(nextQuery);

      return query();
    },
    toggle: () => root.toggle(),
  };

  status.on('resize', updateStatus);
  updateChildren();

  return handle;
}
