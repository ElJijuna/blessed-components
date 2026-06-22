import { visibleWidth } from '@/core/width.js';
import type { ScrollAreaMetrics } from '@/primitives/scroll-area/index.js';

/** Characters used by {@link renderScrollAreaScrollbar}. */
export interface ScrollAreaCharacters {
  /** Character filling the movable thumb. */
  thumb: string;

  /** Character filling the scrollbar track. */
  track: string;
}

/** Options accepted by {@link renderScrollAreaScrollbar}. */
export interface RenderScrollAreaScrollbarOptions extends ScrollAreaMetrics {
  /**
   * Track and thumb characters.
   *
   * @defaultValue `{ track: '│', thumb: '█' }`
   */
  characters?: ScrollAreaCharacters;
}

/**
 * Renders one vertical scrollbar from headless ScrollArea metrics.
 *
 * Returns an empty string when all content is already visible.
 */
export function renderScrollAreaScrollbar({
  characters = { thumb: '█', track: '│' },
  contentSize,
  thumbOffset,
  thumbSize,
  viewportSize,
}: RenderScrollAreaScrollbarOptions): string {
  if (visibleWidth(characters.track) !== 1 || visibleWidth(characters.thumb) !== 1) {
    throw new RangeError('ScrollArea characters must each occupy one terminal cell.');
  }

  if (contentSize <= viewportSize || viewportSize === 0) {
    return '';
  }

  return Array.from({ length: viewportSize }, (_, index) =>
    index >= thumbOffset && index < thumbOffset + thumbSize ? characters.thumb : characters.track,
  ).join('\n');
}
