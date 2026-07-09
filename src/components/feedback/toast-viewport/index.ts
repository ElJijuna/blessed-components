import { renderPlainLines } from '@/components/shared/text.js';

/** Toast visual tone. */
export type ToastViewportTone = 'error' | 'info' | 'success' | 'warning';

/** Toast item rendered by {@link renderToastViewport}. */
export interface ToastViewportItem {
  /** Stable toast id. */
  id: string;

  /** Toast message. */
  message: string;

  /** Optional title. */
  title?: string;

  /** Semantic tone. */
  tone?: ToastViewportTone;
}

/** Options accepted by {@link renderToastViewport}. */
export interface RenderToastViewportOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Toasts ordered oldest to newest. */
  items: readonly ToastViewportItem[];

  /** Maximum number of visible toasts. */
  limit?: number;

  /** Render newest items first. */
  newestFirst?: boolean;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

const TONE_MARKERS: Record<ToastViewportTone, string> = {
  error: '!',
  info: 'i',
  success: '+',
  warning: '!',
};

/** Renders a bounded stack of transient notifications. */
export function renderToastViewport({
  height,
  items,
  limit = items.length,
  newestFirst = true,
  width,
}: RenderToastViewportOptions): string {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new RangeError('ToastViewport limit must be a non-negative integer.');
  }

  const visible = (newestFirst ? [...items].reverse() : [...items]).slice(0, limit);
  const lines = visible.map((item) => {
    const marker = TONE_MARKERS[item.tone ?? 'info'];
    const heading = item.title === undefined ? '' : `${item.title}: `;

    return `${marker} ${heading}${item.message}`;
  });

  return renderPlainLines(lines, { height, width });
}
