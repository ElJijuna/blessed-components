import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** One compact command displayed by a Toolbar. */
export interface ToolbarItem {
  disabled?: boolean;
  /** Stable command identifier. */
  id: string;
  /** Non-empty visible icon or short glyph. */
  icon: string;
  /** Accessible command description. */
  label: string;
  /** Starts a new visual command group. */
  separator?: boolean;
  /** Optional visible keyboard shortcut. */
  shortcut?: string;
}

/** Character tokens used by {@link renderToolbar}. */
export interface ToolbarCharacters {
  activeLeft: string;
  activeRight: string;
  disabledLeft: string;
  disabledRight: string;
  overflow: string;
  separator: string;
  shortcutLeft: string;
  shortcutRight: string;
}

export const TOOLBAR_UNICODE_CHARACTERS: Readonly<ToolbarCharacters> = Object.freeze({
  activeLeft: '▸',
  activeRight: '◂',
  disabledLeft: '(',
  disabledRight: ')',
  overflow: '…',
  separator: '│',
  shortcutLeft: '[',
  shortcutRight: ']',
});

export const TOOLBAR_ASCII_CHARACTERS: Readonly<ToolbarCharacters> = Object.freeze({
  activeLeft: '>',
  activeRight: '<',
  disabledLeft: '(',
  disabledRight: ')',
  overflow: '...',
  separator: '|',
  shortcutLeft: '[',
  shortcutRight: ']',
});

export interface RenderToolbarOptions<TItem extends ToolbarItem = ToolbarItem> {
  activeId?: string;
  characters?: ToolbarCharacters;
  /** Hide labels and shortcuts while preserving accessible item data. */
  dense?: boolean;
  items: readonly TItem[];
  pad?: boolean;
  width: number;
}

export interface ToolbarRenderResult {
  content: string;
  visibleItemIds: readonly string[];
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value))
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

function itemText(
  item: ToolbarItem,
  activeId: string | undefined,
  dense: boolean,
  c: ToolbarCharacters,
): string {
  const shortcut =
    dense || item.shortcut === undefined
      ? ''
      : ` ${c.shortcutLeft}${plainText(item.shortcut)}${c.shortcutRight}`;
  const body = dense
    ? plainText(item.icon)
    : `${plainText(item.icon)} ${plainText(item.label)}${shortcut}`;

  if (item.disabled) {
    return `${c.disabledLeft}${body}${c.disabledRight}`;
  }

  return item.id === activeId ? `${c.activeLeft}${body}${c.activeRight}` : body;
}

/** Lays out Toolbar commands and reports the commands visible before overflow. */
export function renderToolbarModel<TItem extends ToolbarItem>({
  activeId,
  characters = TOOLBAR_UNICODE_CHARACTERS,
  dense = false,
  items,
  pad = false,
  width,
}: RenderToolbarOptions<TItem>): ToolbarRenderResult {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Toolbar width must be a non-negative integer.');
  }

  const ids = new Set<string>();

  for (const item of items) {
    if ([item.id, item.icon, item.label].some((value) => plainText(value).length === 0)) {
      throw new RangeError('Toolbar item ids, icons, and labels must be non-empty.');
    }

    if (ids.has(item.id)) {
      throw new RangeError(`Toolbar item ids must be unique: ${item.id}.`);
    }

    ids.add(item.id);
  }

  if (width === 0) {
    return { content: '', visibleItemIds: [] };
  }

  let content = '';

  const visibleItemIds: string[] = [];

  for (const item of items) {
    const text = itemText(item, activeId, dense, characters);
    const prefix = content.length === 0 ? '' : item.separator ? ` ${characters.separator} ` : '  ';
    const reserve =
      visibleItemIds.length + 1 < items.length ? visibleWidth(` ${characters.overflow}`) : 0;

    if (visibleWidth(content) + visibleWidth(prefix) + visibleWidth(text) + reserve > width) {
      break;
    }

    content += `${prefix}${text}`;
    visibleItemIds.push(item.id);
  }

  if (visibleItemIds.length < items.length) {
    content = truncateText(
      `${content}${content.length > 0 ? ' ' : ''}${characters.overflow}`,
      width,
    );
  }

  if (pad) {
    content += ' '.repeat(Math.max(0, width - visibleWidth(content)));
  }

  return { content, visibleItemIds };
}

/** Renders a compact horizontal command group. */
export function renderToolbar<TItem extends ToolbarItem>(
  options: RenderToolbarOptions<TItem>,
): string {
  return renderToolbarModel(options).content;
}
