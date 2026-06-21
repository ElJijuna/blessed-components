import { clamp } from '../../core/scale.js';

/**
 * Scroll-area dimensions updated as one transaction.
 */
export interface ScrollAreaSizes {
  /** Total number of cells or rows in the content. */
  contentSize: number;

  /** Number of visible cells or rows. */
  viewportSize: number;
}

/**
 * Options accepted by {@link createScrollArea}.
 */
export interface CreateScrollAreaOptions extends ScrollAreaSizes {
  /** Called when an operation changes the offset. */
  onScroll?: (offset: number) => void;

  /** Initial content offset. */
  offset?: number;

  /**
   * Number of visible cells retained between page operations.
   *
   * @defaultValue `1`
   */
  pageOverlap?: number;
}

/**
 * Scrollbar metrics derived from current dimensions and offset.
 */
export interface ScrollAreaMetrics extends ScrollAreaSizes {
  /** Current bounded content offset. */
  offset: number;

  /** Scrollbar thumb start within a track equal to `viewportSize`. */
  thumbOffset: number;

  /** Scrollbar thumb length within a track equal to `viewportSize`. */
  thumbSize: number;
}

/**
 * One-dimensional scrolling behavior shared by vertical and horizontal views.
 */
export interface ScrollAreaModel {
  /** Moves to the maximum offset. */
  end(): number;

  /** Moves to offset zero. */
  home(): number;

  /** Moves backward by one or more cells. */
  lineBackward(amount?: number): number;

  /** Moves forward by one or more cells. */
  lineForward(amount?: number): number;

  /** Returns current content and scrollbar measurements. */
  metrics(): ScrollAreaMetrics;

  /** Moves backward by one page minus configured overlap. */
  pageBackward(): number;

  /** Moves forward by one page minus configured overlap. */
  pageForward(): number;

  /** Replaces dimensions and reclamps the offset. */
  setSizes(sizes: ScrollAreaSizes): number;

  /** Moves to an absolute offset. */
  scrollTo(offset: number): number;
}

function validateSizes({ contentSize, viewportSize }: ScrollAreaSizes): void {
  if (
    !Number.isInteger(contentSize) ||
    contentSize < 0 ||
    !Number.isInteger(viewportSize) ||
    viewportSize < 0
  ) {
    throw new RangeError('Scroll-area sizes must be non-negative integers.');
  }
}

/**
 * Creates one-dimensional line, page, and scrollbar behavior.
 *
 * Instantiate one model per axis when a component supports both horizontal and
 * vertical scrolling.
 *
 * @param options - Content size, viewport size, initial offset, and listener.
 * @returns A bounded scroll state model.
 */
export function createScrollArea({
  contentSize,
  onScroll,
  offset = 0,
  pageOverlap = 1,
  viewportSize,
}: CreateScrollAreaOptions): ScrollAreaModel {
  validateSizes({ contentSize, viewportSize });

  if (!Number.isInteger(pageOverlap) || pageOverlap < 0) {
    throw new RangeError('Scroll-area page overlap must be a non-negative integer.');
  }

  let sizes = { contentSize, viewportSize };
  let currentOffset = clamp(offset, 0, Math.max(0, contentSize - viewportSize));

  const scrollTo = (nextOffset: number): number => {
    if (!Number.isInteger(nextOffset)) {
      throw new RangeError('Scroll offset must be an integer.');
    }

    const clampedOffset = clamp(nextOffset, 0, Math.max(0, sizes.contentSize - sizes.viewportSize));

    if (clampedOffset !== currentOffset) {
      currentOffset = clampedOffset;
      onScroll?.(currentOffset);
    }

    return currentOffset;
  };
  const pageSize = (): number => Math.max(1, sizes.viewportSize - pageOverlap);

  return {
    end: () => scrollTo(sizes.contentSize - sizes.viewportSize),
    home: () => scrollTo(0),
    lineBackward: (amount = 1) => scrollTo(currentOffset - amount),
    lineForward: (amount = 1) => scrollTo(currentOffset + amount),
    metrics() {
      if (sizes.viewportSize === 0 || sizes.contentSize === 0) {
        return { ...sizes, offset: currentOffset, thumbOffset: 0, thumbSize: 0 };
      }

      const thumbSize = Math.min(
        sizes.viewportSize,
        Math.max(1, Math.floor(sizes.viewportSize ** 2 / sizes.contentSize)),
      );
      const maxOffset = Math.max(0, sizes.contentSize - sizes.viewportSize);
      const maxThumbOffset = sizes.viewportSize - thumbSize;
      const thumbOffset =
        maxOffset === 0 ? 0 : Math.round((currentOffset / maxOffset) * maxThumbOffset);

      return { ...sizes, offset: currentOffset, thumbOffset, thumbSize };
    },
    pageBackward: () => scrollTo(currentOffset - pageSize()),
    pageForward: () => scrollTo(currentOffset + pageSize()),
    scrollTo,
    setSizes(nextSizes) {
      validateSizes(nextSizes);
      sizes = { ...nextSizes };

      return scrollTo(currentOffset);
    },
  };
}
