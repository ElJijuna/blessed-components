import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** One labeled value rendered by {@link renderKeyValue}. */
export interface KeyValueItem {
  /** Non-empty label identifying the value. Must fit on one line. */
  key: string;

  /** Display value. Numeric values must be finite. */
  value: number | string;
}

/** Available arrangements for {@link renderKeyValue}. */
export type KeyValueLayout = 'inline' | 'rows';

/** Options accepted by {@link renderKeyValue}. */
export interface RenderKeyValueOptions {
  /**
   * Spaces around a non-empty separator. When the separator is empty, the gap
   * is inserted once between key and value.
   *
   * @defaultValue `1`
   */
  gap?: number;

  /** Ordered key/value entries. */
  items: readonly KeyValueItem[];

  /**
   * Text inserted between entries in the inline layout.
   *
   * @defaultValue `' · '`
   */
  itemSeparator?: string;

  /**
   * Width reserved for every key in terminal cells.
   *
   * `auto` uses the widest key. A numeric width truncates longer keys.
   *
   * @defaultValue `'auto'`
   */
  keyWidth?: 'auto' | number;

  /**
   * Entry arrangement.
   *
   * @defaultValue `'rows'`
   */
  layout?: KeyValueLayout;

  /**
   * Text between each key and value. Use an empty string for whitespace-only
   * separation.
   *
   * @defaultValue `':'`
   */
  separator?: string;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function padEnd(value: string, width: number): string {
  return `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;
}

/**
 * Renders aligned key/value metadata as plain terminal text.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/key-value` to keep Blessed outside the module graph.
 *
 * @param options - Entries, alignment, separator, and layout.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown for empty or multiline keys, non-finite numeric values, an invalid
 * numeric key width, or an invalid gap.
 *
 * @example
 *
 * ```ts
 * import { renderKeyValue } from 'blessed-components/key-value';
 *
 * renderKeyValue({
 *   items: [
 *     { key: 'Status', value: 'Online' },
 *     { key: 'CPU', value: '42%' },
 *   ],
 * });
 * // "Status : Online\nCPU    : 42%"
 * ```
 */
export function renderKeyValue({
  gap = 1,
  items,
  itemSeparator = ' · ',
  keyWidth = 'auto',
  layout = 'rows',
  separator = ':',
}: RenderKeyValueOptions): string {
  if (!Number.isInteger(gap) || gap < 0) {
    throw new RangeError('KeyValue gap must be a non-negative integer.');
  }

  if (keyWidth !== 'auto' && (!Number.isInteger(keyWidth) || keyWidth < 1)) {
    throw new RangeError('KeyValue key width must be a positive integer or auto.');
  }

  const normalizedItems = items.map(({ key, value }) => {
    const normalizedKey = plainText(key);

    if (normalizedKey.length === 0 || /[\r\n]/u.test(normalizedKey)) {
      throw new RangeError('KeyValue keys must be non-empty and fit on one line.');
    }

    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new RangeError('KeyValue numeric values must be finite.');
    }

    return {
      key: normalizedKey,
      value: plainText(String(value)),
    };
  });
  const resolvedKeyWidth =
    keyWidth === 'auto'
      ? normalizedItems.reduce((widest, item) => Math.max(widest, visibleWidth(item.key)), 0)
      : keyWidth;
  const normalizedSeparator = plainText(separator);
  const normalizedItemSeparator = plainText(itemSeparator);
  const beforeSeparator = ' '.repeat(gap);
  const afterSeparator = normalizedSeparator.length === 0 ? '' : beforeSeparator;
  const renderedItems = normalizedItems.map((item) => {
    const fittedKey =
      visibleWidth(item.key) > resolvedKeyWidth
        ? truncateText(item.key, resolvedKeyWidth)
        : item.key;
    const prefix = `${padEnd(fittedKey, resolvedKeyWidth)}${beforeSeparator}${normalizedSeparator}${afterSeparator}`;
    const [firstLine = '', ...continuationLines] = item.value.split('\n');
    const continuationIndent = ' '.repeat(visibleWidth(prefix));

    return [
      `${prefix}${firstLine}`,
      ...continuationLines.map((line) => `${continuationIndent}${line}`),
    ].join('\n');
  });

  return renderedItems.join(layout === 'inline' ? normalizedItemSeparator : '\n');
}
