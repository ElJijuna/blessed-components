import type blessed from 'blessed';

import {
  ROUTE_TABS_ASCII_CHARACTERS,
  ROUTE_TABS_UNICODE_CHARACTERS,
  type RouteTabItem,
  type RouteTabsCharacters,
  renderRouteTabs,
} from '@/components/navigation/route-tabs/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import {
  createHorizontalSelection,
  type HorizontalSelectionData,
} from './internal/horizontal-selection.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the RouteTabs adapter. */
export type RouteTabsBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link routeTabs} adapter. */
export interface RouteTabsData<TItem extends RouteTabItem = RouteTabItem> {
  /** Preferred initial keyboard-focus route. */
  activeId?: string;

  /** Terminal capabilities used to select Unicode or ASCII characters. */
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;

  /** Character tokens used by the pure renderer. */
  characters?: RouteTabsCharacters;

  /** Initial route for uncontrolled usage. Ignored when `routeId` is supplied. */
  defaultRouteId?: string;

  /** Text displayed when no routes are open. */
  emptyText?: string;

  /** Ordered open routes. */
  items: readonly TItem[];

  /** Called after keyboard focus moves to a different enabled route. */
  onActiveIdChange?: (routeId: string) => void;

  /** Called when a closeable focused route requests closing. */
  onClose?: (item: TItem) => void;

  /** Called when a focused route requests navigation. */
  onNavigate?: (routeId: string) => void;

  /** Controlled current route identifier. */
  routeId?: string;

  /** Text inserted between route tabs. */
  separator?: string;
}

/** Options accepted by the Blessed {@link routeTabs} adapter. */
export interface RouteTabsOptions<TItem extends RouteTabItem = RouteTabItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: RouteTabsBoxOptions;

  /** Open routes, current route state, and navigation listeners. */
  data: RouteTabsData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link routeTabs}. */
export interface RouteTabsHandle<TItem extends RouteTabItem = RouteTabItem>
  extends BlessedComponentHandle<RouteTabsData<TItem>, blessed.Widgets.BoxElement> {
  /** Returns the route carrying keyboard focus. */
  activeId(): string | undefined;

  /** Requests closing the focused route when it is closeable. */
  closeActive(): string | undefined;

  /** Requests closing a specific route when it is closeable. */
  closeRoute(routeId: string): string | undefined;

  /** Moves focus to the first enabled route. */
  first(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves keyboard focus to an enabled route. */
  focusRoute(routeId: string): string | undefined;

  /** Moves focus to the last enabled route. */
  last(): string | undefined;

  /** Requests navigation to the focused route. */
  navigateActive(): string | undefined;

  /** Moves focus to the next enabled route, wrapping at the end. */
  next(): string | undefined;

  /** Moves focus to the previous enabled route, wrapping at the start. */
  previous(): string | undefined;

  /** Returns the current controlled or uncontrolled route identifier. */
  routeId(): string | undefined;
}

interface RouteTabsControllerData<TItem extends RouteTabItem>
  extends HorizontalSelectionData<TItem> {
  source: RouteTabsData<TItem>;
}

function controllerData<TItem extends RouteTabItem>(
  data: RouteTabsData<TItem>,
): RouteTabsControllerData<TItem> {
  return {
    ...(data.activeId === undefined ? {} : { activeId: data.activeId }),
    ...(data.defaultRouteId === undefined ? {} : { defaultValue: data.defaultRouteId }),
    items: data.items,
    ...(data.onActiveIdChange === undefined ? {} : { onActiveIdChange: data.onActiveIdChange }),
    source: data,
    ...(data.routeId === undefined ? {} : { value: data.routeId }),
  };
}

/** Creates interactive route-aware tabs backed by a Blessed box. */
export function routeTabs<TItem extends RouteTabItem>({
  box,
  data: initialData,
  parent,
}: RouteTabsOptions<TItem>): RouteTabsHandle<TItem> {
  let data = initialData;

  const controller = createHorizontalSelection<TItem, RouteTabsControllerData<TItem>>({
    ...(box === undefined ? {} : { box }),
    data: controllerData(data),
    onActivate: ({ source }, routeId) => source.onNavigate?.(routeId),
    parent,
    render: ({ activeId, data: currentData, value, width }) => {
      const { source } = currentData;
      const capabilities = source.capabilities ?? detectCapabilities();

      return renderRouteTabs({
        characters:
          source.characters ??
          (capabilities.unicode ? ROUTE_TABS_UNICODE_CHARACTERS : ROUTE_TABS_ASCII_CHARACTERS),
        ...(source.emptyText === undefined ? {} : { emptyText: source.emptyText }),
        ...(activeId === undefined ? {} : { focusedId: activeId }),
        items: source.items,
        ...(value === undefined ? {} : { routeId: value }),
        ...(source.separator === undefined ? {} : { separator: source.separator }),
        width,
      });
    },
  });
  const closeRoute = (routeId: string): string | undefined => {
    const item = data.items.find(
      ({ closable, disabled, id }) => id === routeId && closable === true && disabled !== true,
    );

    if (item === undefined) {
      return undefined;
    }

    data.onClose?.(item);

    return item.id;
  };
  const handle: RouteTabsHandle<TItem> = {
    activeId: controller.activeId,
    closeActive: () => {
      const routeId = controller.activeId();

      return routeId === undefined ? undefined : closeRoute(routeId);
    },
    closeRoute,
    destroy: controller.destroy,
    element: controller.element,
    first: controller.first,
    focus: controller.focus,
    focusRoute: controller.focusItem,
    last: controller.last,
    navigateActive: controller.activateFocused,
    next: controller.next,
    previous: controller.previous,
    routeId: controller.value,
    setData(nextData) {
      data = nextData;
      controller.setData(controllerData(data));
    },
  };

  controller.element.on('keypress', (_character: string, key: { full?: string; name?: string }) => {
    switch (key.full ?? key.name) {
      case 'C-w':
      case 'delete':
        handle.closeActive();
        break;
    }
  });

  return handle;
}
