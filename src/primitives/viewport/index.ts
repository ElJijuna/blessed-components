import { clamp } from '@/core/scale.js';

/**
 * Two-dimensional terminal size.
 */
export interface ViewportSize {
  /** Height measured in terminal rows. */
  height: number;

  /** Width measured in terminal cells. */
  width: number;
}

/**
 * Two-dimensional scroll offset.
 */
export interface ViewportOffset {
  /** Horizontal offset measured in terminal cells. */
  x: number;

  /** Vertical offset measured in terminal rows. */
  y: number;
}

/**
 * Partial offset accepted by viewport scrolling operations.
 */
export interface ViewportOffsetInput {
  /** Horizontal offset measured in terminal cells. */
  x?: number;

  /** Vertical offset measured in terminal rows. */
  y?: number;
}

/**
 * Rectangle expressed in content coordinates.
 */
export interface ViewportRect extends ViewportOffset, ViewportSize {}

/**
 * Options accepted by {@link createViewport}.
 */
export interface CreateViewportOptions extends ViewportSize {
  /** Total content height in rows. */
  contentHeight: number;

  /** Total content width in cells. */
  contentWidth: number;

  /** Initial horizontal offset. */
  x?: number;

  /** Initial vertical offset. */
  y?: number;
}

/**
 * Current viewport dimensions and clamped offsets.
 */
export interface ViewportSnapshot extends ViewportOffset, ViewportSize {
  /** Total content height in rows. */
  contentHeight: number;

  /** Total content width in cells. */
  contentWidth: number;
}

/**
 * Headless two-dimensional viewport state.
 */
export interface ViewportModel {
  /** Scrolls the minimum distance needed to reveal a content rectangle. */
  ensureVisible(rect: ViewportRect): ViewportSnapshot;

  /** Replaces content dimensions and reclamps current offsets. */
  setContentSize(size: { height: number; width: number }): ViewportSnapshot;

  /** Replaces viewport dimensions and reclamps current offsets. */
  resize(size: ViewportSize): ViewportSnapshot;

  /** Scrolls by relative cell and row deltas. */
  scrollBy(offset: ViewportOffsetInput): ViewportSnapshot;

  /** Scrolls to absolute content offsets. */
  scrollTo(offset: ViewportOffsetInput): ViewportSnapshot;

  /** Returns an immutable state snapshot. */
  snapshot(): ViewportSnapshot;
}

function validateSize({ height, width }: ViewportSize, name: string): void {
  if (!Number.isInteger(height) || height < 0 || !Number.isInteger(width) || width < 0) {
    throw new RangeError(`${name} dimensions must be non-negative integers.`);
  }
}

/**
 * Creates a bounded two-dimensional viewport.
 *
 * @param options - Content dimensions, visible dimensions, and initial offset.
 * @returns Viewport state suitable for clipping and virtualized components.
 */
export function createViewport(options: CreateViewportOptions): ViewportModel {
  validateSize(options, 'Viewport');
  validateSize({ height: options.contentHeight, width: options.contentWidth }, 'Content');

  let state: ViewportSnapshot = {
    contentHeight: options.contentHeight,
    contentWidth: options.contentWidth,
    height: options.height,
    width: options.width,
    x: 0,
    y: 0,
  };

  const snapshot = (): ViewportSnapshot => ({ ...state });
  const scrollTo = ({ x = state.x, y = state.y }: ViewportOffsetInput): ViewportSnapshot => {
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new RangeError('Viewport offsets must be integers.');
    }

    state = {
      ...state,
      x: clamp(x, 0, Math.max(0, state.contentWidth - state.width)),
      y: clamp(y, 0, Math.max(0, state.contentHeight - state.height)),
    };

    return snapshot();
  };

  return {
    ensureVisible(rect) {
      validateSize(rect, 'Visible rectangle');

      if (!Number.isInteger(rect.x) || rect.x < 0 || !Number.isInteger(rect.y) || rect.y < 0) {
        throw new RangeError('Visible rectangle offsets must be non-negative integers.');
      }

      const nextX =
        rect.x < state.x ? rect.x : Math.max(state.x, rect.x + rect.width - state.width);
      const nextY =
        rect.y < state.y ? rect.y : Math.max(state.y, rect.y + rect.height - state.height);

      return scrollTo({ x: nextX, y: nextY });
    },
    resize(size) {
      validateSize(size, 'Viewport');
      state = { ...state, ...size };

      return scrollTo({});
    },
    scrollBy({ x = 0, y = 0 }) {
      return scrollTo({ x: state.x + x, y: state.y + y });
    },
    scrollTo,
    setContentSize({ height, width }) {
      validateSize({ height, width }, 'Content');
      state = { ...state, contentHeight: height, contentWidth: width };

      return scrollTo({});
    },
    snapshot,
  };
}
