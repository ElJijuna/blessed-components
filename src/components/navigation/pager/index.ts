import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Labels and markers used by {@link renderPager}. */
export interface PagerLabels {
  /** Label for moving to the next page or record. */
  next: string;

  /** Label for moving to the previous page or record. */
  previous: string;

  /** Separator between current page and page count. */
  statusSeparator: string;
}

/** Options accepted by {@link renderPager}. */
export interface RenderPagerOptions {
  /** Label tokens used by the renderer. */
  labels?: PagerLabels;

  /** Current 1-based page. Values outside the range are clamped. */
  page: number;

  /** Total number of pages. */
  pageCount: number;

  /**
   * Text inserted between pager segments.
   *
   * @defaultValue `'  '`
   */
  separator?: string;

  /**
   * Whether to render `Page x/y` between controls.
   *
   * @defaultValue `true`
   */
  showStatus?: boolean;

  /** Maximum terminal-cell width of the rendered line. */
  width: number;
}

const DEFAULT_LABELS: PagerLabels = {
  next: 'Next',
  previous: 'Previous',
  statusSeparator: '/',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertInteger(value: number, message: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(message);
  }
}

/** Clamps a 1-based pager page to the available page range. */
export function clampPagerPage(page: number, pageCount: number): number {
  assertInteger(page, 'Pager page must be an integer.');
  assertInteger(pageCount, 'Pager pageCount must be an integer.');

  if (pageCount < 1) {
    throw new RangeError('Pager pageCount must be at least 1.');
  }

  return Math.min(Math.max(page, 1), pageCount);
}

/**
 * Renders a compact previous/next pager.
 *
 * @param options - Page state, width, labels, and status visibility.
 * @returns Plain terminal text without ANSI sequences or Blessed tags.
 */
export function renderPager({
  labels = DEFAULT_LABELS,
  page,
  pageCount,
  separator = '  ',
  showStatus = true,
  width,
}: RenderPagerOptions): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Pager width must be a non-negative integer.');
  }

  const currentPage = clampPagerPage(page, pageCount);
  const safeLabels: PagerLabels = {
    next: plainText(labels.next),
    previous: plainText(labels.previous),
    statusSeparator: plainText(labels.statusSeparator),
  };
  const previous = currentPage === 1 ? `(${safeLabels.previous})` : `‹ ${safeLabels.previous}`;
  const next = currentPage === pageCount ? `(${safeLabels.next})` : `${safeLabels.next} ›`;
  const segments = showStatus
    ? [previous, `Page ${currentPage}${safeLabels.statusSeparator}${pageCount}`, next]
    : [previous, next];
  const rendered = segments.join(plainText(separator));

  if (visibleWidth(rendered) <= width) {
    return rendered;
  }

  return truncateText(rendered, width);
}
