import { stripBlessedTags } from '@/core/tags.js';
import { truncateText, wrapText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';
import {
  ALERT_ASCII_MARKERS,
  ALERT_UNICODE_MARKERS,
  type AlertMarkers,
  type AlertTone,
} from '../alert/index.js';

export type BannerTone = AlertTone;
export type BannerMarkers = AlertMarkers;

export const BANNER_UNICODE_MARKERS: Readonly<BannerMarkers> = ALERT_UNICODE_MARKERS;
export const BANNER_ASCII_MARKERS: Readonly<BannerMarkers> = ALERT_ASCII_MARKERS;

/** Options accepted by {@link renderBanner}. */
export interface RenderBannerOptions {
  /** Optional action hint displayed at the end of the first line. */
  action?: string;
  /** Explicit one-cell marker. */
  marker?: string;
  /** Semantic marker mapping. */
  markers?: BannerMarkers;
  /** Required app-level status message. */
  message: string;
  /** Whether to display the semantic marker. @defaultValue `true` */
  showMarker?: boolean;
  /** Optional short heading displayed before the message. */
  title?: string;
  /** Semantic status. @defaultValue `'info'` */
  tone?: BannerTone;
  /** Full rendered width in terminal cells. Lines are padded to this width. */
  width?: number;
}

function sanitize(value: string): string {
  return stripBlessedTags(stripAnsi(value)).replace(/\s+/gu, ' ').trim();
}

function pad(value: string, width: number): string {
  return `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;
}

/**
 * Renders a persistent, full-width application status message.
 *
 * Tone is always represented by a marker, so the result remains meaningful
 * without color. When width is supplied every line occupies that exact width.
 */
export function renderBanner({
  action,
  marker,
  markers = BANNER_UNICODE_MARKERS,
  message,
  showMarker = true,
  title,
  tone = 'info',
  width,
}: RenderBannerOptions): string {
  if (Object.values(markers).some((value) => visibleWidth(value) !== 1)) {
    throw new RangeError('Banner markers must be one terminal cell wide.');
  }

  if (marker !== undefined && visibleWidth(marker) !== 1) {
    throw new RangeError('Banner markers must be one terminal cell wide.');
  }

  if (width !== undefined && (!Number.isInteger(width) || width < 1)) {
    throw new RangeError('Banner width must be a positive integer.');
  }

  const safeMessage = sanitize(message);
  const safeTitle = title === undefined ? '' : sanitize(title);
  const safeAction = action === undefined ? '' : sanitize(action);

  if (safeMessage.length === 0) {
    throw new RangeError('Banner message must be non-empty.');
  }

  const prefix = showMarker ? `${marker ?? markers[tone]} ` : '';
  const body = `${safeTitle.length > 0 ? `${safeTitle}: ` : ''}${safeMessage}`;

  if (width === undefined) {
    return `${prefix}${body}${safeAction.length > 0 ? `  [${safeAction}]` : ''}`;
  }

  const actionText = safeAction.length > 0 ? `[${safeAction}]` : '';
  const prefixWidth = visibleWidth(prefix);
  const available = Math.max(1, width - prefixWidth);
  const canFitAction = actionText.length > 0 && visibleWidth(actionText) + 1 < available;
  const firstBodyWidth = canFitAction
    ? Math.max(1, available - visibleWidth(actionText) - 2)
    : available;
  const bodyLines = wrapText(body, firstBodyWidth);
  const firstBody = bodyLines.shift() ?? '';
  const firstWithoutAction = `${prefix}${firstBody}`;
  const first = canFitAction
    ? `${firstWithoutAction}${' '.repeat(Math.max(2, width - visibleWidth(firstWithoutAction) - visibleWidth(actionText)))}${actionText}`
    : firstWithoutAction;
  const lines = [truncateText(first, width)];

  for (const line of bodyLines.flatMap((value) => wrapText(value, available))) {
    lines.push(`${' '.repeat(prefixWidth)}${line}`);
  }

  if (!canFitAction && actionText.length > 0) {
    lines.push(`${' '.repeat(prefixWidth)}${truncateText(actionText, available)}`);
  }

  return lines.map((line) => pad(line, width)).join('\n');
}
