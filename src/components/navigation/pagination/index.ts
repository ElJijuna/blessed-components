import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** One rendered pagination target. */
export type PaginationItem =
  | {
      disabled: boolean;
      kind: 'control';
      label: string;
      page: number;
      type: 'first' | 'previous' | 'next' | 'last';
    }
  | {
      current: boolean;
      kind: 'page';
      label: string;
      page: number;
    }
  | {
      kind: 'ellipsis';
      label: string;
    };

/** Character and label tokens used by {@link renderPagination}. */
export interface PaginationCharacters {
  /** Marker between non-contiguous page ranges. */
  ellipsis: string;

  /** Label for the first-page control. */
  first: string;

  /** Label for the last-page control. */
  last: string;

  /** Label for the next-page control. */
  next: string;

  /** Label for the previous-page control. */
  previous: string;
}

/** Options accepted by {@link createPaginationItems}. */
export interface CreatePaginationItemsOptions {
  /** Current 1-based page. Values outside the range are clamped. */
  page: number;

  /**
   * Number of page links shown around the current page.
   *
   * @defaultValue `1`
   */
  siblingCount?: number;

  /**
   * Whether first and last controls should be rendered.
   *
   * @defaultValue `false`
   */
  showBoundaryControls?: boolean;

  /** Total number of pages. */
  pageCount: number;
}

/** Options accepted by {@link renderPagination}. */
export interface RenderPaginationOptions extends CreatePaginationItemsOptions {
  /** Character and label tokens used by the renderer. */
  characters?: PaginationCharacters;

  /**
   * Text inserted between pagination items.
   *
   * @defaultValue `' '`
   */
  separator?: string;

  /** Maximum terminal-cell width of the rendered line. */
  width: number;
}

const DEFAULT_CHARACTERS: PaginationCharacters = {
  ellipsis: '…',
  first: '«',
  last: '»',
  next: '›',
  previous: '‹',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertInteger(value: number, message: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(message);
  }
}

/** Clamps a 1-based page to the available page range. */
export function clampPaginationPage(page: number, pageCount: number): number {
  assertInteger(page, 'Pagination page must be an integer.');
  assertInteger(pageCount, 'Pagination pageCount must be an integer.');

  if (pageCount < 1) {
    throw new RangeError('Pagination pageCount must be at least 1.');
  }

  return Math.min(Math.max(page, 1), pageCount);
}

function addPage(pages: Set<number>, page: number, pageCount: number): void {
  if (page >= 1 && page <= pageCount) {
    pages.add(page);
  }
}

/**
 * Creates a deterministic pagination model independent from terminal output.
 *
 * @param options - Current page, total pages, sibling count, and control visibility.
 * @returns Ordered pagination items.
 */
export function createPaginationItems({
  page,
  pageCount,
  siblingCount = 1,
  showBoundaryControls = false,
}: CreatePaginationItemsOptions): PaginationItem[] {
  assertInteger(siblingCount, 'Pagination siblingCount must be a non-negative integer.');

  if (siblingCount < 0) {
    throw new RangeError('Pagination siblingCount must be a non-negative integer.');
  }

  const currentPage = clampPaginationPage(page, pageCount);
  const pageNumbers = new Set<number>();

  addPage(pageNumbers, 1, pageCount);
  addPage(pageNumbers, pageCount, pageCount);

  for (let index = currentPage - siblingCount; index <= currentPage + siblingCount; index += 1) {
    addPage(pageNumbers, index, pageCount);
  }

  const sortedPages = [...pageNumbers].sort((left, right) => left - right);
  const items: PaginationItem[] = [];

  if (showBoundaryControls) {
    items.push({
      disabled: currentPage === 1,
      kind: 'control',
      label: 'first',
      page: 1,
      type: 'first',
    });
  }

  items.push({
    disabled: currentPage === 1,
    kind: 'control',
    label: 'previous',
    page: Math.max(1, currentPage - 1),
    type: 'previous',
  });

  sortedPages.forEach((pageNumber, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage !== undefined && pageNumber - previousPage > 1) {
      items.push({ kind: 'ellipsis', label: 'ellipsis' });
    }

    items.push({
      current: pageNumber === currentPage,
      kind: 'page',
      label: String(pageNumber),
      page: pageNumber,
    });
  });

  items.push({
    disabled: currentPage === pageCount,
    kind: 'control',
    label: 'next',
    page: Math.min(pageCount, currentPage + 1),
    type: 'next',
  });

  if (showBoundaryControls) {
    items.push({
      disabled: currentPage === pageCount,
      kind: 'control',
      label: 'last',
      page: pageCount,
      type: 'last',
    });
  }

  return items;
}

function renderItem(item: PaginationItem, characters: PaginationCharacters): string {
  if (item.kind === 'ellipsis') {
    return plainText(characters.ellipsis);
  }

  if (item.kind === 'control') {
    return item.disabled
      ? `(${plainText(characters[item.type])})`
      : plainText(characters[item.type]);
  }

  return item.current ? `[${item.label}]` : item.label;
}

/**
 * Renders a single-line pagination control.
 *
 * @param options - Page state, width, labels, and display controls.
 * @returns Plain terminal text without ANSI sequences or Blessed tags.
 */
export function renderPagination({
  characters = DEFAULT_CHARACTERS,
  page,
  pageCount,
  separator = ' ',
  showBoundaryControls = false,
  siblingCount = 1,
  width,
}: RenderPaginationOptions): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Pagination width must be a non-negative integer.');
  }

  const safeCharacters: PaginationCharacters = {
    ellipsis: plainText(characters.ellipsis),
    first: plainText(characters.first),
    last: plainText(characters.last),
    next: plainText(characters.next),
    previous: plainText(characters.previous),
  };
  const safeSeparator = plainText(separator);
  const rendered = createPaginationItems({
    page,
    pageCount,
    showBoundaryControls,
    siblingCount,
  })
    .map((item) => renderItem(item, safeCharacters))
    .join(safeSeparator);

  if (visibleWidth(rendered) <= width) {
    return rendered;
  }

  return truncateText(rendered, width);
}
