import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Semantic activity states supported by ActivityFeed. */
export type ActivityFeedTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';

/** Minimum data required for one ActivityFeed event. */
export interface ActivityFeedItem {
  /** Optional secondary event text. */
  detail?: string;

  /** Stable event identifier. */
  id: string;

  /** Primary event text. */
  label: string;

  /** Optional display timestamp. */
  timestamp?: string;

  /** Semantic event state. */
  tone?: ActivityFeedTone;
}

/** Character tokens used by {@link renderActivityFeed}. */
export interface ActivityFeedCharacters {
  danger: string;
  info: string;
  neutral: string;
  success: string;
  warning: string;
}

/** Options accepted by {@link renderActivityFeed}. */
export interface RenderActivityFeedOptions<TItem extends ActivityFeedItem = ActivityFeedItem> {
  /** Character tokens used to communicate tone without color. */
  characters?: ActivityFeedCharacters;

  /** Text returned when `items` is empty. */
  emptyText?: string;

  /** Maximum rendered rows. */
  height: number;

  /** Ordered activity events. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /** First rendered event index. */
  offset?: number;

  /** Whether timestamps are rendered when present. */
  showTimestamp?: boolean;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: ActivityFeedCharacters = {
  danger: '×',
  info: 'i',
  neutral: '•',
  success: '✓',
  warning: '!',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).trim();
}

function assertViewport(height: number, width: number, offset: number): void {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('ActivityFeed dimensions and offset must be non-negative integers.');
  }
}

/** Renders bounded chronological activity rows. */
export function renderActivityFeed<TItem extends ActivityFeedItem>({
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No activity',
  height,
  items,
  offset = 0,
  showTimestamp = true,
  width,
}: RenderActivityFeedOptions<TItem>): string {
  assertViewport(height, width, offset);

  if (height === 0 || width === 0) {
    return '';
  }

  if (items.length === 0) {
    return truncateText(plainText(emptyText), width);
  }

  return items
    .slice(offset, offset + height)
    .map((item) => {
      const label = plainText(item.label);

      if (item.id.length === 0 || label.length === 0) {
        throw new RangeError('ActivityFeed ids and labels must be non-empty.');
      }

      const marker = characters[item.tone ?? 'neutral'];
      const timestamp =
        showTimestamp && item.timestamp !== undefined ? `[${plainText(item.timestamp)}] ` : '';
      const detail =
        item.detail === undefined || plainText(item.detail).length === 0
          ? ''
          : ` - ${plainText(item.detail)}`;

      return truncateText(`${marker} ${timestamp}${label}${detail}`, width);
    })
    .join('\n');
}
