import { type EmptyStateAlign, renderEmptyState } from '@/components/feedback/empty-state/index.js';
import {
  type RenderSpinnerOptions,
  renderSpinner,
  SPINNER_UNICODE_FRAMES,
} from '@/components/feedback/spinner/index.js';

/** Options accepted by {@link renderLoadingOverlay}. */
export interface RenderLoadingOverlayOptions {
  /**
   * Horizontal alignment applied when width is configured.
   *
   * @defaultValue `'center'`
   */
  align?: EmptyStateAlign;

  /** Optional detail text rendered under the label. */
  description?: string;

  /** Zero-based animation frame. Values wrap by frame count. */
  frame: number;

  /** Ordered one-cell animation frames. @defaultValue `SPINNER_UNICODE_FRAMES` */
  frames?: RenderSpinnerOptions['frames'];

  /** Maximum rendered line count. */
  height?: number;

  /** Primary loading text. @defaultValue `'Loading'` */
  label?: string;

  /** Whether the spinner frame is rendered before the label. @defaultValue `true` */
  showSpinner?: boolean;

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

/**
 * Renders loading overlay content.
 *
 * This pure renderer is deterministic: animation timing belongs to adapters or
 * callers. Dynamic text is sanitized by the composed Spinner and EmptyState
 * renderers.
 */
export function renderLoadingOverlay({
  align = 'center',
  description,
  frame,
  frames = SPINNER_UNICODE_FRAMES,
  height,
  label = 'Loading',
  showSpinner = true,
  width,
}: RenderLoadingOverlayOptions): string {
  const title = showSpinner
    ? renderSpinner({
        frame,
        frames,
        label,
      })
    : label;

  return renderEmptyState({
    align,
    ...(description === undefined ? {} : { description }),
    ...(height === undefined ? {} : { height }),
    showMarker: false,
    title,
    ...(width === undefined ? {} : { width }),
  });
}
