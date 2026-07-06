import blessed from 'blessed';

import {
  clampPagerPage,
  type PagerLabels,
  renderPager,
} from '@/components/navigation/pager/index.js';
import { visibleWidth } from '@/core/width.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Pager adapter. */
export type PagerBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link pager} adapter. */
export interface PagerData {
  /** Initial page for uncontrolled usage. Ignored when `page` is supplied. */
  defaultPage?: number;

  /** Label tokens used by the pure renderer. */
  labels?: PagerLabels;

  /** Called after a page change or controlled page request. */
  onPageChange?: (page: number) => void;

  /** Controlled 1-based current page. */
  page?: number;

  /** Total number of pages. */
  pageCount: number;

  /** Text inserted between rendered pager segments. */
  separator?: string;

  /** Whether to render `Page x/y` between controls. */
  showStatus?: boolean;
}

/** Options accepted by the Blessed {@link pager} adapter. */
export interface PagerOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: PagerBoxOptions;

  /** Page state, renderer options, and change listener. */
  data: PagerData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link pager}. */
export interface PagerHandle extends BlessedComponentHandle<PagerData, blessed.Widgets.BoxElement> {
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

interface Region {
  action: 'next' | 'previous';
  end: number;
  start: number;
}

const DEFAULT_LABELS: PagerLabels = {
  next: 'Next',
  previous: 'Previous',
  statusSeparator: '/',
};

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function absoluteElementLeft(element: blessed.Widgets.BoxElement): number {
  const positionedElement = element as blessed.Widgets.BoxElement & {
    aleft?: blessed.Widgets.Types.TPosition;
  };

  return numericDimension(positionedElement.aleft ?? positionedElement.left);
}

function controlLabels(page: number, pageCount: number, labels: PagerLabels): [string, string] {
  return [
    page === 1 ? `(${labels.previous})` : `‹ ${labels.previous}`,
    page === pageCount ? `(${labels.next})` : `${labels.next} ›`,
  ];
}

/** Creates an interactive previous/next Pager backed by a Blessed box. */
export function pager({ box, data: initialData, parent }: PagerOptions): PagerHandle {
  let data = initialData;
  let uncontrolledPage = initialData.defaultPage ?? initialData.page ?? 1;
  let regions: Region[] = [];

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
    clampPagerPage(isControlled() ? (data.page ?? 1) : uncontrolledPage, data.pageCount);
  const labels = (): PagerLabels => ({ ...DEFAULT_LABELS, ...data.labels });
  const separator = (): string => data.separator ?? '  ';
  const rebuildRegions = (): void => {
    const page = currentPage();
    const [previous, next] = controlLabels(page, data.pageCount, labels());
    const previousWidth = visibleWidth(previous);
    const separatorWidth = visibleWidth(separator());
    const statusWidth =
      data.showStatus === false
        ? 0
        : visibleWidth(`Page ${page}${labels().statusSeparator}${data.pageCount}`);
    const nextStart =
      previousWidth +
      separatorWidth +
      (data.showStatus === false ? 0 : statusWidth + separatorWidth);

    regions = [
      { action: 'previous', end: previousWidth, start: 0 },
      { action: 'next', end: nextStart + visibleWidth(next), start: nextStart },
    ];
  };
  const render = (): void => {
    element.setContent(
      renderPager({
        ...(data.labels === undefined ? {} : { labels: data.labels }),
        page: currentPage(),
        pageCount: data.pageCount,
        ...(data.separator === undefined ? {} : { separator: data.separator }),
        ...(data.showStatus === undefined ? {} : { showStatus: data.showStatus }),
        width: width(),
      }),
    );
    rebuildRegions();
  };
  const setPage = (nextPage: number): number => {
    const page = clampPagerPage(nextPage, data.pageCount);

    if (!isControlled()) {
      uncontrolledPage = page;
    }

    data.onPageChange?.(page);
    render();

    return currentPage();
  };
  const clickedAction = (screenX: number): 'next' | 'previous' | undefined => {
    const column = screenX - absoluteElementLeft(element) - numericDimension(element.ileft);

    if (!Number.isInteger(column) || column < 0 || column >= width()) {
      return undefined;
    }

    return regions.find(({ end, start }) => column >= start && column < end)?.action;
  };

  render();

  const handle: PagerHandle = {
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
      uncontrolledPage = clampPagerPage(uncontrolledPage, data.pageCount);
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

    const action = clickedAction(event.x);

    if (action !== undefined) {
      handle[action]();
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
