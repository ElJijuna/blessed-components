import type { ViewportSnapshot } from '@/primitives/viewport/index.js';

/** Positioned content rectangle rendered inside a Viewport. */
export interface ViewportContentLayout {
  /** Total content height in rows. */
  height: number;

  /** Negative horizontal offset applied to content. */
  left: number;

  /** Negative vertical offset applied to content. */
  top: number;

  /** Total content width in cells. */
  width: number;
}

/** Deterministic visual layout for a Viewport snapshot. */
export interface ViewportLayout {
  /** Content dimensions and translated position. */
  content: ViewportContentLayout;

  /** Visible dimensions and content-coordinate offset. */
  visible: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
}

/**
 * Converts headless Viewport state into Blessed-compatible positioning.
 *
 * Content moves in the opposite direction of scroll offsets while the outer
 * container clips descendants to its visible rectangle.
 */
export function calculateViewportLayout(snapshot: ViewportSnapshot): ViewportLayout {
  return {
    content: {
      height: snapshot.contentHeight,
      left: -snapshot.x,
      top: -snapshot.y,
      width: snapshot.contentWidth,
    },
    visible: {
      height: snapshot.height,
      width: snapshot.width,
      x: snapshot.x,
      y: snapshot.y,
    },
  };
}
