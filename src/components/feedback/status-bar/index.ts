import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Alignment zones supported by StatusBar. */
export type StatusBarSection = 'center' | 'left' | 'right';

/** One status item rendered inside a StatusBar section. */
export interface StatusBarItem {
  /** Optional detail rendered after the label. */
  detail?: string;

  /** Non-empty primary item text. */
  label: string;

  /** Optional one-cell marker rendered before the label. */
  marker?: string;

  /**
   * Section receiving the item.
   *
   * @defaultValue `'left'`
   */
  section?: StatusBarSection;
}

/** Character set used by {@link renderStatusBar}. */
export interface StatusBarCharacters {
  /** Separator inserted between items in the same section. */
  itemSeparator: string;

  /** Separator inserted between label and detail. */
  labelSeparator: string;
}

/** Default Unicode StatusBar characters. */
export const STATUS_BAR_UNICODE_CHARACTERS: Readonly<StatusBarCharacters> = Object.freeze({
  itemSeparator: ' │ ',
  labelSeparator: ': ',
});

/** Default ASCII StatusBar characters. */
export const STATUS_BAR_ASCII_CHARACTERS: Readonly<StatusBarCharacters> = Object.freeze({
  itemSeparator: ' | ',
  labelSeparator: ': ',
});

/** Options accepted by {@link renderStatusBar}. */
export interface RenderStatusBarOptions {
  /**
   * Character set used for separators.
   *
   * @defaultValue `STATUS_BAR_UNICODE_CHARACTERS`
   */
  characters?: StatusBarCharacters;

  /**
   * Optional one-line message. When present, it is rendered after left items.
   */
  message?: string;

  /** Status items grouped into left, center, and right sections. */
  items?: readonly StatusBarItem[];

  /**
   * Whether the output is padded to exactly `width` cells.
   *
   * @defaultValue `true`
   */
  pad?: boolean;

  /** Available width in terminal cells. */
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).trim();
}

function assertWidth(value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError('StatusBar width must be a non-negative integer.');
  }
}

function assertOneCellMarker(value: string): void {
  if (visibleWidth(value) !== 1) {
    throw new RangeError('StatusBar markers must be one terminal cell wide.');
  }
}

function fitToWidth(value: string, width: number): string {
  return truncateText(value, width);
}

function renderItem(
  { detail, label, marker }: StatusBarItem,
  labelSeparator: string,
): string | undefined {
  const safeLabel = plainText(label);

  if (safeLabel.length === 0) {
    return undefined;
  }

  if (marker !== undefined) {
    assertOneCellMarker(marker);
  }

  const safeDetail = detail === undefined ? undefined : plainText(detail);
  const content =
    safeDetail === undefined || safeDetail.length === 0
      ? safeLabel
      : `${safeLabel}${labelSeparator}${safeDetail}`;

  return marker === undefined ? content : `${marker} ${content}`;
}

function joinSection(
  items: readonly StatusBarItem[],
  section: StatusBarSection,
  separator: string,
  labelSeparator: string,
): string {
  return items
    .filter((item) => (item.section ?? 'left') === section)
    .map((item) => renderItem(item, labelSeparator))
    .filter((item): item is string => item !== undefined)
    .join(separator);
}

function padEndByWidth(value: string, width: number): string {
  return `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;
}

/**
 * Renders a single-line application StatusBar.
 *
 * StatusBar is intended for persistent application context: current mode,
 * selected resource counts, connection state, background task state, and
 * shortcut hints. Dynamic text is stripped of ANSI sequences and Blessed tags.
 */
export function renderStatusBar({
  characters = STATUS_BAR_UNICODE_CHARACTERS,
  items = [],
  message,
  pad = true,
  width,
}: RenderStatusBarOptions): string {
  assertWidth(width);

  if (width === 0) {
    return '';
  }

  const separator = stripAnsi(stripBlessedTags(characters.itemSeparator));
  const labelSeparator = stripAnsi(stripBlessedTags(characters.labelSeparator));
  const normalizedMessage = message === undefined ? undefined : plainText(message);
  const leftItems = joinSection(items, 'left', separator, labelSeparator);
  const left =
    normalizedMessage === undefined || normalizedMessage.length === 0
      ? leftItems
      : leftItems.length === 0
        ? normalizedMessage
        : `${leftItems}${separator}${normalizedMessage}`;
  const center = joinSection(items, 'center', separator, labelSeparator);
  const right = joinSection(items, 'right', separator, labelSeparator);

  if (right.length === 0 && center.length === 0) {
    const fitted = fitToWidth(left, width);

    return pad ? padEndByWidth(fitted, width) : fitted;
  }

  const rightWidth = visibleWidth(right);
  const centerWidth = visibleWidth(center);

  if (rightWidth + 1 >= width) {
    const fitted = fitToWidth(right, width);

    return pad ? padEndByWidth(fitted, width) : fitted;
  }

  const leftBudget = Math.max(0, width - rightWidth - 1);
  const fittedLeft = fitToWidth(left, leftBudget);
  const gap = ' '.repeat(Math.max(1, width - visibleWidth(fittedLeft) - rightWidth));

  let line = `${fittedLeft}${gap}${right}`;

  if (center.length > 0 && centerWidth < width) {
    const centerStart = Math.max(0, Math.floor((width - centerWidth) / 2));
    const centerEnd = centerStart + centerWidth;
    const chars = Array.from(line.padEnd(width, ' '));
    const wouldOverlap =
      chars.slice(centerStart, centerEnd).some((char) => char !== ' ') ||
      centerStart === 0 ||
      centerEnd >= width;

    if (!wouldOverlap) {
      for (const [index, char] of Array.from(center).entries()) {
        chars[centerStart + index] = char;
      }

      line = chars.join('');
    }
  }

  const fitted = fitToWidth(line, width);

  return pad ? padEndByWidth(fitted, width) : fitted;
}
