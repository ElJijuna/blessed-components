import { assertPlainDimensions, fitPlain, plain } from '@/components/shared/text.js';

/** One application route represented as a tab. */
export interface RouteTabItem {
  /** Whether this route exposes a close action. */
  closable?: boolean;

  /** Whether navigation and closing must skip this route. */
  disabled?: boolean;

  /** Whether the route contains unsaved changes. */
  dirty?: boolean;

  /** Stable route identifier. */
  id: string;

  /** Visible route label. */
  label: string;
}

/** Character tokens used by {@link renderRouteTabs}. */
export interface RouteTabsCharacters {
  /** Marker rendered for a closeable route. */
  close: string;

  /** Marker rendered for a disabled route. */
  disabled: string;

  /** Marker rendered for a route with unsaved changes. */
  dirty: string;

  /** Marker rendered before the keyboard-focused route. */
  focused: string;
}

/** Unicode character set used by RouteTabs. */
export const ROUTE_TABS_UNICODE_CHARACTERS: Readonly<RouteTabsCharacters> = Object.freeze({
  close: '×',
  disabled: '–',
  dirty: '●',
  focused: '›',
});

/** ASCII character set used when Unicode is unavailable. */
export const ROUTE_TABS_ASCII_CHARACTERS: Readonly<RouteTabsCharacters> = Object.freeze({
  close: 'x',
  disabled: '-',
  dirty: '*',
  focused: '>',
});

/** Options accepted by {@link renderRouteTabs}. */
export interface RenderRouteTabsOptions<TItem extends RouteTabItem = RouteTabItem> {
  /** Character tokens for interaction and route state. */
  characters?: RouteTabsCharacters;

  /** Text displayed when no routes are open. */
  emptyText?: string;

  /** Route identifier carrying keyboard focus. */
  focusedId?: string;

  /** Ordered open routes. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /** Currently selected route identifier. */
  routeId?: string;

  /** Text inserted between route tabs. */
  separator?: string;

  /** Maximum terminal-cell width of the rendered row. */
  width?: number;
}

function oneLine(value: string): string {
  return plain(value)
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

function validateItems(items: readonly RouteTabItem[]): void {
  const ids = new Set<string>();

  for (const item of items) {
    if (oneLine(item.id).length === 0 || oneLine(item.label).length === 0) {
      throw new RangeError('RouteTabs route ids and labels must be non-empty.');
    }

    if (ids.has(item.id)) {
      throw new RangeError('RouteTabs route ids must be unique.');
    }

    ids.add(item.id);
  }
}

/**
 * Renders open application routes as a one-line tab strip.
 *
 * The selected route is bracketed. Dirty, disabled, focused, and closeable
 * states use text markers so none of the interaction contract relies on color.
 */
export function renderRouteTabs<TItem extends RouteTabItem>({
  characters = ROUTE_TABS_UNICODE_CHARACTERS,
  emptyText = '- No open routes',
  focusedId,
  items,
  routeId,
  separator = ' ',
  width,
}: RenderRouteTabsOptions<TItem>): string {
  assertPlainDimensions({ width }, 'RouteTabs');
  validateItems(items);

  if (items.length === 0) {
    return fitPlain(oneLine(emptyText), width);
  }

  const tokens = {
    close: oneLine(characters.close),
    disabled: oneLine(characters.disabled),
    dirty: oneLine(characters.dirty),
    focused: oneLine(characters.focused),
  };
  const rendered = items.map((item) => {
    const focused = item.id === focusedId ? tokens.focused : ' ';
    const state =
      item.disabled === true ? tokens.disabled : item.dirty === true ? tokens.dirty : ' ';
    const close = item.closable === true && item.disabled !== true ? ` ${tokens.close}` : '';
    const label = oneLine(item.label);
    const content = item.id === routeId ? `[${label}${close}]` : ` ${label}${close} `;

    return `${focused}${state}${content}`;
  });

  return fitPlain(rendered.join(oneLine(separator)), width);
}
