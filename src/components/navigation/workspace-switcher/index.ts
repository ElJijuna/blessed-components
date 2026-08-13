import { fitPlain, plain } from '@/components/shared/text.js';

/** One workspace available to WorkspaceSwitcher. */
export interface WorkspaceSwitcherItem {
  disabled?: boolean;
  environment?: string;
  id: string;
  label: string;
  status?: string;
}
/** Character tokens used by WorkspaceSwitcher. */
export interface WorkspaceSwitcherCharacters {
  active: string;
  disabled: string;
  selected: string;
}
export const WORKSPACE_SWITCHER_UNICODE_CHARACTERS: Readonly<WorkspaceSwitcherCharacters> =
  Object.freeze({ active: '›', disabled: '×', selected: '●' });
export const WORKSPACE_SWITCHER_ASCII_CHARACTERS: Readonly<WorkspaceSwitcherCharacters> =
  Object.freeze({ active: '>', disabled: 'x', selected: '*' });
/** Renderer options. */
export interface RenderWorkspaceSwitcherOptions<
  TItem extends WorkspaceSwitcherItem = WorkspaceSwitcherItem,
> {
  activeId?: string;
  characters?: WorkspaceSwitcherCharacters;
  height?: number;
  items: readonly TItem[];
  offset?: number;
  query?: string;
  value?: string;
  width?: number;
}
/** Render result plus visible item ids. */
export interface WorkspaceSwitcherRenderResult {
  content: string;
  visibleItemIds: readonly string[];
}

function oneLine(value: string): string {
  return plain(value)
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

export function filterWorkspaceSwitcherItems<TItem extends WorkspaceSwitcherItem>(
  items: readonly TItem[],
  query = '',
): readonly TItem[] {
  const token = oneLine(query).toLowerCase();

  if (token.length === 0) {
    return [...items];
  }

  return items.filter((item) =>
    [item.label, item.environment, item.status]
      .filter((value): value is string => value !== undefined)
      .some((value) => oneLine(value).toLowerCase().includes(token)),
  );
}

/** Renders a searchable workspace selector with environment and status metadata. */
export function renderWorkspaceSwitcherModel<TItem extends WorkspaceSwitcherItem>({
  activeId,
  characters = WORKSPACE_SWITCHER_UNICODE_CHARACTERS,
  height,
  items,
  offset = 0,
  query = '',
  value,
  width,
}: RenderWorkspaceSwitcherOptions<TItem>): WorkspaceSwitcherRenderResult {
  if (
    (height !== undefined && (!Number.isInteger(height) || height < 0)) ||
    (width !== undefined && (!Number.isInteger(width) || width < 0)) ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('WorkspaceSwitcher dimensions and offset must be non-negative integers.');
  }

  const ids = new Set<string>();

  for (const item of items) {
    if (oneLine(item.id).length === 0 || oneLine(item.label).length === 0) {
      throw new RangeError('WorkspaceSwitcher item ids and labels must be non-empty.');
    }

    if (ids.has(item.id)) {
      throw new RangeError('WorkspaceSwitcher item ids must be unique.');
    }

    ids.add(item.id);
  }

  const matches = filterWorkspaceSwitcherItems(items, query);
  const visible =
    height === undefined ? matches.slice(offset) : matches.slice(offset, offset + height);

  if (visible.length === 0) {
    return { content: fitPlain('- No matching workspaces', width), visibleItemIds: [] };
  }

  const lines = visible.map((item) => {
    const cursor = item.id === activeId ? characters.active : ' ';
    const state = item.disabled
      ? characters.disabled
      : item.id === value
        ? characters.selected
        : ' ';
    const environment = item.environment === undefined ? '' : ` · ${oneLine(item.environment)}`;
    const status = item.status === undefined ? '' : ` · ${oneLine(item.status)}`;

    return fitPlain(`${cursor} ${state} ${oneLine(item.label)}${environment}${status}`, width);
  });

  return { content: lines.join('\n'), visibleItemIds: visible.map(({ id }) => id) };
}

export function renderWorkspaceSwitcher<TItem extends WorkspaceSwitcherItem>(
  options: RenderWorkspaceSwitcherOptions<TItem>,
): string {
  return renderWorkspaceSwitcherModel(options).content;
}
