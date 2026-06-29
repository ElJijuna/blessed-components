import {
  renderStatus,
  STATUS_UNICODE_MARKERS,
  type StatusMarkers,
  type StatusTone,
} from '@/components/feedback/status/index.js';
import { type FormatDateTimeOptions, formatDateTime } from '@/core/format.js';
import { truncateText } from '@/core/truncate.js';

/** Structured event accepted by Timeline. */
export interface TimelineItem {
  /** Stable item id used by adapters and callers. */
  id: string;

  /** Primary event text. ANSI sequences and Blessed tags are stripped. */
  title: string;

  /** Optional secondary event text. */
  detail?: string;

  /** Event timestamp rendered when `showTimestamp` is enabled. */
  timestamp?: Date | number | string;

  /** Semantic event state used for the timeline marker. */
  tone?: StatusTone;
}

/** Options accepted by {@link renderTimeline}. */
export interface RenderTimelineOptions extends FormatDateTimeOptions {
  /** Text displayed when no items exist. */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Ordered timeline items. Caller-owned data is never mutated. */
  items: readonly TimelineItem[];

  /** Semantic marker characters. */
  markers?: StatusMarkers;

  /** First rendered item index. */
  offset?: number;

  /** Whether to include semantic markers. @defaultValue `true` */
  showMarker?: boolean;

  /** Whether to include timestamps when present. @defaultValue `true` */
  showTimestamp?: boolean;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

function assertDimensions(height: number, width: number, offset: number): void {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('Timeline dimensions and offset must be non-negative integers.');
  }
}

function renderTimelineItem({
  item,
  locale,
  markers,
  showMarker,
  showTimestamp,
  timeZone,
  width,
}: {
  item: TimelineItem;
  locale: string | undefined;
  markers: StatusMarkers;
  showMarker: boolean;
  showTimestamp: boolean;
  timeZone: string | undefined;
  width: number;
}): string {
  const timestamp =
    showTimestamp && item.timestamp !== undefined
      ? `${formatDateTime(item.timestamp, {
          ...(locale === undefined ? {} : { locale }),
          ...(timeZone === undefined ? {} : { timeZone }),
        })} `
      : '';

  return truncateText(
    renderStatus({
      ...(item.detail === undefined ? {} : { detail: item.detail }),
      label: `${timestamp}${item.title}`,
      markers,
      showMarker,
      tone: item.tone ?? 'neutral',
    }),
    width,
  );
}

/**
 * Renders a bounded, terminal-cell-aware timeline viewport.
 *
 * Timeline preserves the caller's item order, strips unsafe text through the
 * Status renderer, and formats timestamps with the shared date formatter.
 */
export function renderTimeline({
  emptyText = 'No timeline events',
  height,
  items,
  locale,
  markers = STATUS_UNICODE_MARKERS,
  offset = 0,
  showMarker = true,
  showTimestamp = true,
  timeZone,
  width,
}: RenderTimelineOptions): string {
  assertDimensions(height, width, offset);

  if (height === 0) {
    return '';
  }

  if (items.length === 0) {
    return truncateText(emptyText, width);
  }

  return items
    .slice(offset, offset + height)
    .map((item) =>
      renderTimelineItem({
        item,
        locale,
        markers,
        showMarker,
        showTimestamp,
        timeZone,
        width,
      }),
    )
    .join('\n');
}
