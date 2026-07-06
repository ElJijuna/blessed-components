import blessed from 'blessed';

import {
  clampPaginationPage,
  createPaginationItems,
  type PaginationCharacters,
  type PaginationItem,
  renderPagination,
} from '@/components/navigation/pagination/index.js';
import { visibleWidth } from '@/core/width.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Pagination adapter. */
export type PaginationBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link pagination} adapter. */
export interface PaginationData {
  /** Character and label tokens used by the pure renderer. */
  characters?: PaginationCharacters;

  /** Initial page for uncontrolled usage. Ignored when `page` is supplied. */
  defaultPage?: number;

  /** Called after a page change or controlled page request. */
  onPageChange?: (page: number) => void;

  /** Controlled 1-based current page. */
  page?: number;

  /** Total number of pages. */
  pageCount: number;

  /** Text inserted between rendered pagination items. */
  separator?: string;

  /** Number of page links shown around the current page. */
  siblingCount?: number;

  /** Whether first and last controls should be rendered. */
  showBoundaryControls?: boolean;
}

/** Options accepted by the Blessed {@link pagination} adapter. */
export interface PaginationOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: PaginationBoxOptions;

  /** Page state, renderer options, and change listener. */
  data: PaginationData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link pagination}. */
export interface PaginationHandle
  extends BlessedComponentHandle<PaginationData, blessed.Widgets.BoxElement> {
  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves to the first page. */
  first(): number;

  /** Requests a specific 1-based page. */
  goToPage(page: number): number;

  /** Moves to the last page. */
  last(): number;

  /** Moves to the next page. */
  next(): number;

  /** Returns the current controlled or uncontrolled page. */
  page(): number;

  /** Moves to the previous page. */
  previous(): number;
}

interface Keypress {
  full?: string;
  name?: string;
}

interface MouseEvent {
  x?: number;
}

interface RenderedRegion {
  end: number;
  item: PaginationItem;
  start: number;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function absoluteElementLeft(element: blessed.Widgets.BoxElement): number {
  const positionedElement = element as blessed.Widgets.BoxElement & {
    aleft?: blessed.Widgets.Types.TPosition;
  };

  return numericDimension(positionedElement.aleft ?? positionedElement.left);
}

function controlLabel(item: PaginationItem, characters: PaginationCharacters): string {
  if (item.kind === 'ellipsis') {
    return characters.ellipsis;
  }

  if (item.kind === 'page') {
    return item.current ? `[${item.label}]` : item.label;
  }

  const label = characters[item.type];

  return item.disabled ? `(${label})` : label;
}

const DEFAULT_CHARACTERS: PaginationCharacters = {
  ellipsis: '…',
  first: '«',
  last: '»',
  next: '›',
  previous: '‹',
};

/** Creates an interactive Pagination control backed by a Blessed box. */
export function pagination({
  box,
  data: initialData,
  parent,
}: PaginationOptions): PaginationHandle {
  let data = initialData;
  let uncontrolledPage = initialData.defaultPage ?? initialData.page ?? 1;
  let regions: RenderedRegion[] = [];

  const element = blessed.box({
    keys: true,
    mouse: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const width = (): number =>
    Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const isControlled = (): boolean => Object.hasOwn(data, 'page');
  const currentPage = (): number =>
    clampPaginationPage(isControlled() ? (data.page ?? 1) : uncontrolledPage, data.pageCount);
  const characters = (): PaginationCharacters => ({ ...DEFAULT_CHARACTERS, ...data.characters });
  const separator = (): string => data.separator ?? ' ';
  const model = (): PaginationItem[] =>
    createPaginationItems({
      page: currentPage(),
      pageCount: data.pageCount,
      ...(data.showBoundaryControls === undefined
        ? {}
        : { showBoundaryControls: data.showBoundaryControls }),
      ...(data.siblingCount === undefined ? {} : { siblingCount: data.siblingCount }),
    });
  const rebuildRegions = (): void => {
    const itemSeparator = separator();

    let cursor = 0;

    regions = model().map((item, index) => {
      if (index > 0) {
        cursor += visibleWidth(itemSeparator);
      }

      const start = cursor;

      cursor += visibleWidth(controlLabel(item, characters()));

      return { end: cursor, item, start };
    });
  };
  const render = (): void => {
    element.setContent(
      renderPagination({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        page: currentPage(),
        pageCount: data.pageCount,
        ...(data.separator === undefined ? {} : { separator: data.separator }),
        ...(data.showBoundaryControls === undefined
          ? {}
          : { showBoundaryControls: data.showBoundaryControls }),
        ...(data.siblingCount === undefined ? {} : { siblingCount: data.siblingCount }),
        width: width(),
      }),
    );
    rebuildRegions();
  };
  const setPage = (nextPage: number): number => {
    const page = clampPaginationPage(nextPage, data.pageCount);

    if (!isControlled()) {
      uncontrolledPage = page;
    }

    data.onPageChange?.(page);
    render();

    return currentPage();
  };
  const clickedPage = (screenX: number): number | undefined => {
    const column = screenX - absoluteElementLeft(element) - numericDimension(element.ileft);

    if (!Number.isInteger(column) || column < 0 || column >= width()) {
      return undefined;
    }

    const region = regions.find(({ end, start }) => column >= start && column < end);

    if (region?.item.kind === 'ellipsis' || region?.item === undefined) {
      return undefined;
    }

    return region.item.kind === 'control' && region.item.disabled ? undefined : region.item.page;
  };

  render();

  const handle: PaginationHandle = {
    destroy() {
      element.destroy();
    },
    element,
    first: () => setPage(1),
    focus() {
      element.focus();
    },
    goToPage: setPage,
    last: () => setPage(data.pageCount),
    next: () => setPage(currentPage() + 1),
    page: currentPage,
    previous: () => setPage(currentPage() - 1),
    setData(nextData) {
      data = nextData;
      uncontrolledPage = clampPaginationPage(uncontrolledPage, data.pageCount);
      render();
    },
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'end':
        handle.last();
        break;
      case 'home':
        handle.first();
        break;
      case 'left':
      case 'pageup':
        handle.previous();
        break;
      case 'pagedown':
      case 'right':
        handle.next();
        break;
    }
  });
  element.on('click', (event: MouseEvent) => {
    if (event.x === undefined) {
      return;
    }

    const page = clickedPage(event.x);

    if (page !== undefined) {
      handle.goToPage(page);
    }
  });
  element.on('resize', render);
  element.on('wheeldown', () => {
    handle.next();
  });
  element.on('wheelup', () => {
    handle.previous();
  });

  return handle;
}
