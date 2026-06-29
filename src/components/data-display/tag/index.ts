import { type RenderTextOptions, renderText } from '../text/index.js';

/** Delimiters used by the bracketed Tag variant. */
export interface TagDelimiters {
  /** Closing delimiter rendered after tag content. */
  close: string;

  /** Opening delimiter rendered before tag content. */
  open: string;
}

/** Visual structures supported by {@link renderTag}. */
export type TagVariant = 'bracketed' | 'hash' | 'plain';

/** Options accepted by {@link renderTag}. */
export interface RenderTagOptions extends Omit<RenderTextOptions, 'content'> {
  /**
   * Delimiters used by the `bracketed` variant.
   *
   * Both values must be non-empty.
   *
   * @defaultValue `{ open: '[', close: ']' }`
   */
  delimiters?: TagDelimiters;

  /**
   * Prefix used by the `hash` variant.
   *
   * @defaultValue `'#'`
   */
  prefix?: string;

  /**
   * Whether the tag includes a remove affordance marker.
   *
   * @defaultValue `false`
   */
  removable?: boolean;

  /**
   * Marker appended when `removable` is enabled.
   *
   * @defaultValue `'×'`
   */
  removeMarker?: string;

  /** Non-empty tag label. ANSI sequences and Blessed tags are removed. */
  text: string;

  /**
   * Tag structure.
   *
   * @defaultValue `'hash'`
   */
  variant?: TagVariant;
}

/**
 * Renders a compact categorization tag as safe terminal text.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/tag` to keep Blessed outside the module graph.
 *
 * @param options - Label, visual variant, removable marker, and text layout.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown for empty text, empty delimiters, an empty hash prefix, an empty remove
 * marker when removable, or invalid text dimensions.
 */
export function renderTag({
  delimiters = { close: ']', open: '[' },
  prefix = '#',
  removable = false,
  removeMarker = '×',
  text,
  variant = 'hash',
  ...textOptions
}: RenderTagOptions): string {
  if (text.length === 0) {
    throw new RangeError('Tag text must be non-empty.');
  }

  if (variant === 'hash' && prefix.length === 0) {
    throw new RangeError('Tag prefix must be non-empty.');
  }

  if (variant === 'bracketed' && (delimiters.open.length === 0 || delimiters.close.length === 0)) {
    throw new RangeError('Tag delimiters must be non-empty.');
  }

  if (removable && removeMarker.length === 0) {
    throw new RangeError('Tag remove marker must be non-empty when removable.');
  }

  const body = removable ? `${text} ${removeMarker}` : text;
  const content =
    variant === 'hash'
      ? `${prefix}${body}`
      : variant === 'bracketed'
        ? `${delimiters.open}${body}${delimiters.close}`
        : body;

  return renderText({
    ...textOptions,
    content,
  });
}
