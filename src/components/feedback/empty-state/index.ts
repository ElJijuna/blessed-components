import { stripBlessedTags } from '@/core/tags.js';
import { wrapText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Horizontal alignment for EmptyState lines. */
export type EmptyStateAlign = 'center' | 'left' | 'right';

/** Options accepted by {@link renderEmptyState}. */
export interface RenderEmptyStateOptions {
  /**
   * Optional action hint rendered after the description.
   *
   * Empty sanitized actions are omitted.
   */
  action?: string;

  /**
   * Horizontal alignment applied when width is configured.
   *
   * @defaultValue `'center'`
   */
  align?: EmptyStateAlign;

  /**
   * Optional detail text rendered under the title.
   *
   * Empty sanitized descriptions are omitted.
   */
  description?: string;

  /** Maximum rendered line count. */
  height?: number;

  /**
   * Optional marker rendered before the title.
   *
   * @defaultValue `'○'`
   */
  marker?: string;

  /**
   * Whether the marker is rendered.
   *
   * @defaultValue `true`
   */
  showMarker?: boolean;

  /** Non-empty primary empty-state message. */
  title: string;

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

function assertDimensions(width: number | undefined, height: number | undefined): void {
  if (
    (width !== undefined && (!Number.isInteger(width) || width < 1)) ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('EmptyState dimensions must be positive width and non-negative height.');
  }
}

function alignLine(value: string, width: number, align: EmptyStateAlign): string {
  if (value.length === 0) {
    return value;
  }

  const padding = Math.max(0, width - visibleWidth(value));

  if (align === 'right') {
    return `${' '.repeat(padding)}${value}`;
  }

  if (align === 'center') {
    return `${' '.repeat(Math.floor(padding / 2))}${value}`;
  }

  return value;
}

function wrapLines(value: string, width: number | undefined): string[] {
  if (width === undefined) {
    return value.split('\n');
  }

  return value.split('\n').flatMap((line) => {
    if (line.length === 0) {
      return [''];
    }

    const words = line.split(/\s+/u);
    const lines: string[] = [];

    let current = '';

    for (const word of words) {
      if (word.length === 0) {
        continue;
      }

      if (visibleWidth(word) > width) {
        if (current.length > 0) {
          lines.push(current);
          current = '';
        }

        lines.push(...wrapText(word, width));
        continue;
      }

      const next = current.length === 0 ? word : `${current} ${word}`;

      if (visibleWidth(next) <= width) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    }

    if (current.length > 0) {
      lines.push(current);
    }

    return lines;
  });
}

/**
 * Renders a compact empty-state message.
 *
 * EmptyState is useful for empty results, missing configuration, or first-run
 * panels. It renders plain terminal text and strips dynamic ANSI sequences and
 * Blessed tags.
 */
export function renderEmptyState({
  action,
  align = 'center',
  description,
  height,
  marker = '○',
  showMarker = true,
  title,
  width,
}: RenderEmptyStateOptions): string {
  assertDimensions(width, height);

  if (showMarker && visibleWidth(marker) !== 1) {
    throw new RangeError('EmptyState marker must be one terminal cell wide.');
  }

  const safeTitle = sanitizeText(title);

  if (safeTitle.length === 0) {
    throw new RangeError('EmptyState title must be non-empty.');
  }

  const safeDescription = description === undefined ? '' : sanitizeText(description);
  const safeAction = action === undefined ? '' : sanitizeText(action);
  const titlePrefix = showMarker ? `${marker} ` : '';
  const textWidth =
    width === undefined ? undefined : Math.max(1, width - visibleWidth(titlePrefix));
  const lines = [
    ...wrapLines(safeTitle, textWidth).map((line, index) =>
      index === 0 ? `${titlePrefix}${line}` : `${showMarker ? '  ' : ''}${line}`,
    ),
    ...(safeDescription.length > 0 ? [''] : []),
    ...(safeDescription.length > 0 ? wrapLines(safeDescription, width) : []),
    ...(safeAction.length > 0 ? [''] : []),
    ...(safeAction.length > 0 ? wrapLines(safeAction, width) : []),
  ];
  const boundedLines = height === undefined ? lines : lines.slice(0, height);

  return width === undefined
    ? boundedLines.join('\n')
    : boundedLines.map((line) => alignLine(line, width, align)).join('\n');
}
