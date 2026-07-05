import { stripBlessedTags } from '@/core/tags.js';
import { wrapText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Semantic tones supported by Toast. */
export type ToastTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';

/** Semantic marker characters used by {@link renderToast}. */
export interface ToastMarkers {
  /** Marker for destructive, failed, or unavailable messages. */
  danger: string;

  /** Marker for informational messages. */
  info: string;

  /** Marker for default messages without positive or negative meaning. */
  neutral: string;

  /** Marker for successful messages. */
  success: string;

  /** Marker for warning or degraded messages. */
  warning: string;
}

/** Default Unicode Toast markers. */
export const TOAST_UNICODE_MARKERS: Readonly<ToastMarkers> = Object.freeze({
  danger: 'x',
  info: 'i',
  neutral: '-',
  success: '+',
  warning: '!',
});

/** One Toast notification. */
export interface ToastItem {
  /** Creation timestamp in milliseconds. */
  createdAt?: number;

  /** Optional detail text rendered under the title. */
  description?: string;

  /** Auto-dismiss duration in milliseconds. `Infinity` keeps the toast. */
  durationMs?: number;

  /** Stable unique identifier. */
  id: string;

  /** Primary toast text. */
  title: string;

  /** Semantic status used to select a marker. @defaultValue `'info'` */
  tone?: ToastTone;
}

/** Options accepted by {@link renderToast}. */
export interface RenderToastOptions extends ToastItem {
  /** Explicit one-cell marker rendered before the title. */
  marker?: string;

  /**
   * Semantic marker mapping.
   *
   * Every marker must be exactly one terminal cell wide.
   *
   * @defaultValue `TOAST_UNICODE_MARKERS`
   */
  markers?: ToastMarkers;

  /** Whether the semantic marker is rendered. @defaultValue `true` */
  showMarker?: boolean;

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

/** Options accepted by {@link renderToastStack}. */
export interface RenderToastStackOptions {
  /** Empty lines inserted between toasts. @defaultValue `1` */
  gap?: number;

  /** Semantic marker mapping forwarded to each toast. */
  markers?: ToastMarkers;

  /** Whether semantic markers are rendered. @defaultValue `true` */
  showMarker?: boolean;

  /** Toasts to render in their provided order. */
  toasts: readonly ToastItem[];

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

/** Options accepted by {@link createToastStackState}. */
export interface CreateToastStackStateOptions {
  /** Maximum retained toasts. @defaultValue `5` */
  maxToasts?: number;

  /** Initial toast collection. */
  toasts?: readonly ToastItem[];
}

/** Controlled Toast stack state model. */
export interface ToastStackStateModel {
  /** Adds or replaces a toast and returns the visible stack. */
  add(toast: ToastItem): readonly ToastItem[];

  /** Removes all toasts and returns the visible stack. */
  clear(): readonly ToastItem[];

  /** Removes one toast by id and returns the visible stack. */
  dismiss(id: string): readonly ToastItem[];

  /** Returns the visible stack. */
  list(): readonly ToastItem[];

  /** Removes expired toasts for a timestamp and returns the visible stack. */
  prune(now: number): readonly ToastItem[];

  /** Replaces options while preserving current toasts unless provided. */
  setOptions(options: CreateToastStackStateOptions): readonly ToastItem[];
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

function assertPositiveInteger(value: number | undefined, label: string): void {
  if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
    throw new RangeError(`${label} must be a positive integer.`);
  }
}

function assertNonNegativeInteger(value: number | undefined, label: string): void {
  if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
    throw new RangeError(`${label} must be a non-negative integer.`);
  }
}

function assertOneCellMarkers(markers: ToastMarkers): void {
  if (Object.values(markers).some((value) => visibleWidth(value) !== 1)) {
    throw new RangeError('Toast markers must be one terminal cell wide.');
  }
}

function wrapLines(value: string, width: number | undefined): string[] {
  if (width === undefined) {
    return value.split('\n');
  }

  assertPositiveInteger(width, 'Toast width');

  return value.split('\n').flatMap((line) => {
    if (line.length === 0) {
      return [''];
    }

    return wrapText(line, width);
  });
}

function isExpired(toast: ToastItem, now: number): boolean {
  if (
    toast.createdAt === undefined ||
    toast.durationMs === undefined ||
    toast.durationMs === Infinity
  ) {
    return false;
  }

  return toast.createdAt + toast.durationMs <= now;
}

function normalizeToasts(
  toasts: readonly ToastItem[],
  maxToasts: number,
  now?: number,
): readonly ToastItem[] {
  const deduped = new Map<string, ToastItem>();

  for (const toast of toasts) {
    if (sanitizeText(toast.id).length === 0) {
      throw new RangeError('Toast id must be non-empty.');
    }

    if (sanitizeText(toast.title).length === 0) {
      throw new RangeError('Toast title must be non-empty.');
    }

    if (
      toast.createdAt !== undefined &&
      (!Number.isFinite(toast.createdAt) || toast.createdAt < 0)
    ) {
      throw new RangeError('Toast createdAt must be a non-negative finite number.');
    }

    if (
      toast.durationMs !== undefined &&
      toast.durationMs !== Infinity &&
      (!Number.isFinite(toast.durationMs) || toast.durationMs < 0)
    ) {
      throw new RangeError('Toast durationMs must be non-negative, finite, or Infinity.');
    }

    if (now === undefined || !isExpired(toast, now)) {
      deduped.delete(toast.id);
      deduped.set(toast.id, toast);
    }
  }

  return Array.from(deduped.values()).slice(-maxToasts).reverse();
}

/**
 * Renders one compact toast message.
 *
 * Dynamic text is sanitized so callers cannot inject ANSI sequences or
 * Blessed tags. Wrapped detail lines align with the first line text.
 */
export function renderToast({
  description,
  marker,
  markers = TOAST_UNICODE_MARKERS,
  showMarker = true,
  title,
  tone = 'info',
  width,
}: RenderToastOptions): string {
  assertOneCellMarkers(markers);
  assertPositiveInteger(width, 'Toast width');

  if (marker !== undefined && visibleWidth(marker) !== 1) {
    throw new RangeError('Toast markers must be one terminal cell wide.');
  }

  const safeTitle = sanitizeText(title);

  if (safeTitle.length === 0) {
    throw new RangeError('Toast title must be non-empty.');
  }

  const safeDescription = description === undefined ? '' : sanitizeText(description);
  const selectedMarker = marker ?? markers[tone];
  const prefix = showMarker ? `${selectedMarker} ` : '';
  const continuationPrefix = showMarker ? '  ' : '';
  const textWidth = width === undefined ? undefined : Math.max(1, width - visibleWidth(prefix));
  const lines: string[] = [];

  for (const line of wrapLines(safeTitle, textWidth)) {
    lines.push(lines.length === 0 ? `${prefix}${line}` : `${continuationPrefix}${line}`);
  }

  if (safeDescription.length > 0) {
    for (const line of wrapLines(safeDescription, textWidth)) {
      lines.push(`${continuationPrefix}${line}`);
    }
  }

  return lines.join('\n');
}

/** Renders a Toast stack in the provided order. */
export function renderToastStack({
  gap = 1,
  markers,
  showMarker = true,
  toasts,
  width,
}: RenderToastStackOptions): string {
  assertNonNegativeInteger(gap, 'Toast gap');
  assertPositiveInteger(width, 'Toast width');

  const spacer = '\n'.repeat(gap + 1);

  return toasts
    .map((toast) =>
      renderToast({
        ...toast,
        ...(markers === undefined ? {} : { markers }),
        showMarker,
        ...(width === undefined ? {} : { width }),
      }),
    )
    .join(spacer);
}

/**
 * Creates a small Toast stack state model.
 *
 * The newest toast is listed first. Adding a toast with an existing id replaces
 * it and moves it to the top.
 */
export function createToastStackState(
  initialOptions: CreateToastStackStateOptions = {},
): ToastStackStateModel {
  let options = initialOptions;
  let maxToasts = options.maxToasts ?? 5;
  let toasts = normalizeToasts(options.toasts ?? [], maxToasts);

  assertPositiveInteger(maxToasts, 'Toast maxToasts');

  return {
    add(toast) {
      toasts = normalizeToasts([...toasts].reverse().concat(toast), maxToasts);

      return toasts;
    },
    clear() {
      toasts = [];

      return toasts;
    },
    dismiss(id) {
      toasts = toasts.filter((toast) => toast.id !== id);

      return toasts;
    },
    list() {
      return toasts;
    },
    prune(now) {
      if (!Number.isFinite(now) || now < 0) {
        throw new RangeError('Toast prune timestamp must be a non-negative finite number.');
      }

      toasts = normalizeToasts([...toasts].reverse(), maxToasts, now);

      return toasts;
    },
    setOptions(nextOptions) {
      options = nextOptions;
      maxToasts = options.maxToasts ?? maxToasts;

      assertPositiveInteger(maxToasts, 'Toast maxToasts');

      toasts = normalizeToasts(options.toasts ?? [...toasts].reverse(), maxToasts);

      return toasts;
    },
  };
}
