import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';
import { type RenderTextOptions, renderText } from '../text/index.js';

/** One segment rendered by {@link renderBreadcrumb}. */
export interface BreadcrumbItem {
  /** Stable item identifier for callers that mirror navigation state. */
  id?: string;

  /** Visible segment label. ANSI sequences and Blessed tags are removed. */
  label: string;
}

/** Options accepted by {@link renderBreadcrumb}. */
export interface RenderBreadcrumbOptions extends Omit<RenderTextOptions, 'content'> {
  /**
   * Whether to collapse middle segments to the omission marker when width is
   * constrained.
   *
   * @defaultValue `true`
   */
  collapse?: boolean;

  /** Ordered path segments. */
  items: readonly BreadcrumbItem[];

  /**
   * Text inserted between path segments.
   *
   * @defaultValue `' / '`
   */
  separator?: string;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function joinSegments(segments: readonly string[], separator: string): string {
  return segments.join(separator);
}

function collapsedSegments(segments: readonly string[], omission: string): string[] {
  return segments.length <= 2
    ? [...segments]
    : [segments[0] ?? '', omission, segments.at(-1) ?? ''];
}

/**
 * Renders a safe, compact location path.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/breadcrumb` to keep Blessed outside the module graph.
 *
 * When `width` is supplied, the renderer first collapses middle segments to the
 * omission marker. If the collapsed path is still too wide, final fitting is
 * delegated to {@link renderText}.
 *
 * @param options - Path segments, separator, collapse policy, and text layout.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown for empty or multiline labels, an empty separator for multi-segment
 * paths, an empty omission marker, or invalid text dimensions.
 */
export function renderBreadcrumb({
  collapse = true,
  items,
  omission = '…',
  separator = ' / ',
  width,
  ...textOptions
}: RenderBreadcrumbOptions): string {
  if (omission.length === 0) {
    throw new RangeError('Breadcrumb omission marker must be non-empty.');
  }

  const labels = items.map(({ label }) => {
    const normalizedLabel = plainText(label);

    if (normalizedLabel.length === 0 || /[\r\n]/u.test(normalizedLabel)) {
      throw new RangeError('Breadcrumb labels must be non-empty and fit on one line.');
    }

    return normalizedLabel;
  });
  const normalizedSeparator = plainText(separator);

  if (labels.length > 1 && normalizedSeparator.length === 0) {
    throw new RangeError('Breadcrumb separator must be non-empty for multi-segment paths.');
  }

  const fullContent = joinSegments(labels, normalizedSeparator);
  const content =
    collapse && width !== undefined && labels.length > 2 && visibleWidth(fullContent) > width
      ? joinSegments(collapsedSegments(labels, omission), normalizedSeparator)
      : fullContent;

  return renderText({
    ...textOptions,
    content,
    omission,
    overflow: textOptions.overflow ?? 'truncate',
    ...(width === undefined ? {} : { width }),
  });
}
