import { type EmptyStateAlign, renderEmptyState } from '@/components/feedback/empty-state/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi } from '@/core/width.js';

/** Options accepted by {@link renderErrorState}. */
export interface RenderErrorStateOptions {
  /**
   * Horizontal alignment applied when width is configured.
   *
   * @defaultValue `'center'`
   */
  align?: EmptyStateAlign;

  /**
   * Optional underlying cause rendered under the message.
   *
   * Empty sanitized causes are omitted.
   */
  cause?: string;

  /** Maximum rendered line count. */
  height?: number;

  /**
   * Optional marker rendered before the message.
   *
   * @defaultValue `'×'`
   */
  marker?: string;

  /** Non-empty primary error message. */
  message: string;

  /**
   * Optional retry or recovery hint rendered after the cause.
   *
   * Empty sanitized retry hints are omitted.
   */
  retry?: string;

  /**
   * Whether the marker is rendered.
   *
   * @defaultValue `true`
   */
  showMarker?: boolean;

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

/**
 * Renders a compact error-state message.
 *
 * ErrorState communicates a failed or unavailable state with optional cause
 * and recovery text. It renders plain terminal text and strips dynamic ANSI
 * sequences and Blessed tags.
 */
export function renderErrorState({
  align = 'center',
  cause,
  height,
  marker = '×',
  message,
  retry,
  showMarker = true,
  width,
}: RenderErrorStateOptions): string {
  const safeCause = cause === undefined ? '' : sanitizeText(cause);
  const safeRetry = retry === undefined ? '' : sanitizeText(retry);
  const description =
    safeCause.length > 0 && safeRetry.length > 0
      ? `${safeCause}\n${safeRetry}`
      : safeCause || safeRetry || undefined;

  return renderEmptyState({
    align,
    ...(description === undefined ? {} : { description }),
    ...(height === undefined ? {} : { height }),
    marker,
    showMarker,
    title: message,
    ...(width === undefined ? {} : { width }),
  });
}
