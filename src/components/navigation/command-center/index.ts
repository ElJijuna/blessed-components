import { fitPlain, plain } from '@/components/shared/text.js';

/** One command surfaced by CommandCenter. */
export interface CommandCenterItem {
  description?: string;
  disabled?: boolean;
  group?: string;
  id: string;
  label: string;
  shortcut?: string;
}
/** Character tokens used by CommandCenter. */
export interface CommandCenterCharacters {
  active: string;
  disabled: string;
  group: string;
  recent: string;
}
export const COMMAND_CENTER_UNICODE_CHARACTERS: Readonly<CommandCenterCharacters> = Object.freeze({
  active: '›',
  disabled: '×',
  group: '■',
  recent: '↺',
});
export const COMMAND_CENTER_ASCII_CHARACTERS: Readonly<CommandCenterCharacters> = Object.freeze({
  active: '>',
  disabled: 'x',
  group: '#',
  recent: '@',
});
/** Renderer options. */
export interface RenderCommandCenterOptions<TItem extends CommandCenterItem = CommandCenterItem> {
  activeId?: string;
  characters?: CommandCenterCharacters;
  height?: number;
  items: readonly TItem[];
  query?: string;
  recentIds?: readonly string[];
  width?: number;
}
/** Render result plus command ids visible after clipping. */
export interface CommandCenterRenderResult {
  content: string;
  visibleItemIds: readonly string[];
}

function oneLine(value: string): string {
  return plain(value)
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

export function filterCommandCenterItems<TItem extends CommandCenterItem>(
  items: readonly TItem[],
  query = '',
): readonly TItem[] {
  const token = oneLine(query).toLowerCase();

  if (token.length === 0) {
    return [...items];
  }

  return items.filter((item) =>
    [item.label, item.description, item.group, item.shortcut]
      .filter((value): value is string => value !== undefined)
      .some((value) => oneLine(value).toLowerCase().includes(token)),
  );
}

/** Renders a command search surface with recent commands and grouped results. */
export function renderCommandCenterModel<TItem extends CommandCenterItem>({
  activeId,
  characters = COMMAND_CENTER_UNICODE_CHARACTERS,
  height,
  items,
  query = '',
  recentIds = [],
  width,
}: RenderCommandCenterOptions<TItem>): CommandCenterRenderResult {
  if (
    (height !== undefined && (!Number.isInteger(height) || height < 0)) ||
    (width !== undefined && (!Number.isInteger(width) || width < 0))
  ) {
    throw new RangeError('CommandCenter dimensions must be non-negative integers.');
  }

  const ids = new Set<string>();

  for (const item of items) {
    if (oneLine(item.id).length === 0 || oneLine(item.label).length === 0) {
      throw new RangeError('CommandCenter item ids and labels must be non-empty.');
    }

    if (ids.has(item.id)) {
      throw new RangeError('CommandCenter item ids must be unique.');
    }

    ids.add(item.id);
  }

  const normalizedQuery = oneLine(query);
  const matches = filterCommandCenterItems(items, normalizedQuery);
  const recentSet = new Set(recentIds);
  const ordered =
    normalizedQuery.length === 0
      ? [
          ...matches.filter(({ id }) => recentSet.has(id)),
          ...matches.filter(({ id }) => !recentSet.has(id)),
        ]
      : [...matches];
  const lines: { id?: string; text: string }[] = [
    { text: `> ${normalizedQuery.length === 0 ? 'Type a command' : normalizedQuery}` },
  ];

  let previousSection = '';

  for (const item of ordered) {
    const section =
      normalizedQuery.length === 0 && recentSet.has(item.id)
        ? 'Recent'
        : (item.group ?? 'Commands');

    if (section !== previousSection) {
      lines.push({ text: `${characters.group} ${oneLine(section)}` });
      previousSection = section;
    }

    const marker = item.disabled
      ? characters.disabled
      : item.id === activeId
        ? characters.active
        : ' ';
    const recent = recentSet.has(item.id) ? `${characters.recent} ` : '';
    const description = item.description === undefined ? '' : ` - ${oneLine(item.description)}`;
    const shortcut = item.shortcut === undefined ? '' : ` [${oneLine(item.shortcut)}]`;

    lines.push({
      id: item.id,
      text: `${marker} ${recent}${oneLine(item.label)}${description}${shortcut}`,
    });
  }

  if (ordered.length === 0) {
    lines.push({ text: '- No matching commands' });
  }

  const visible = height === undefined ? lines : lines.slice(0, height);

  return {
    content: visible.map(({ text }) => fitPlain(text, width)).join('\n'),
    visibleItemIds: visible.flatMap(({ id }) => (id === undefined ? [] : [id])),
  };
}

export function renderCommandCenter<TItem extends CommandCenterItem>(
  options: RenderCommandCenterOptions<TItem>,
): string {
  return renderCommandCenterModel(options).content;
}
