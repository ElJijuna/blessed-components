import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Semantic emphasis associated with an ActionBar action. */
export type ActionBarTone = 'danger' | 'default' | 'primary';

/** One command displayed by an ActionBar. */
export interface ActionBarAction {
  /** Optional explanation for a disabled action. */
  disabledReason?: string;
  /** Whether the action cannot receive focus or be activated. */
  disabled?: boolean;
  /** Stable action identifier. */
  id: string;
  /** Human-readable action label. */
  label: string;
  /** Render a separator before this action. */
  separator?: boolean;
  /** Optional visible keyboard shortcut. */
  shortcut?: string;
  /** Semantic action emphasis. */
  tone?: ActionBarTone;
}

/** Character tokens used by {@link renderActionBar}. */
export interface ActionBarCharacters {
  activeLeft: string;
  activeRight: string;
  disabledLeft: string;
  disabledRight: string;
  overflow: string;
  separator: string;
  shortcutLeft: string;
  shortcutRight: string;
}

export const ACTION_BAR_UNICODE_CHARACTERS: Readonly<ActionBarCharacters> = Object.freeze({
  activeLeft: '▸', activeRight: '◂', disabledLeft: '(', disabledRight: ')', overflow: '…',
  separator: '│', shortcutLeft: '[', shortcutRight: ']',
});

export const ACTION_BAR_ASCII_CHARACTERS: Readonly<ActionBarCharacters> = Object.freeze({
  activeLeft: '>', activeRight: '<', disabledLeft: '(', disabledRight: ')', overflow: '...',
  separator: '|', shortcutLeft: '[', shortcutRight: ']',
});

/** Options accepted by {@link renderActionBar}. */
export interface RenderActionBarOptions<TAction extends ActionBarAction = ActionBarAction> {
  /** Ordered actions. Caller-owned data is never mutated. */
  actions: readonly TAction[];
  /** Identifier receiving the visible focus marker. */
  activeId?: string;
  /** Character tokens used to render state and separators. */
  characters?: ActionBarCharacters;
  /** Whether output is padded to exactly `width` cells. @defaultValue `false` */
  pad?: boolean;
  /** Available terminal-cell width. */
  width: number;
}

/** Result of laying out an ActionBar. Useful for mouse hit testing. */
export interface ActionBarRenderResult {
  /** Action ids actually present in the rendered output. */
  visibleActionIds: readonly string[];
  /** Rendered single-line content. */
  content: string;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).replace(/[\r\n]+/gu, ' ').trim();
}

function assertAction(action: ActionBarAction): void {
  if (plainText(action.id).length === 0 || plainText(action.label).length === 0) {
    throw new RangeError('ActionBar action ids and labels must be non-empty.');
  }
}

function renderAction(action: ActionBarAction, activeId: string | undefined, c: ActionBarCharacters): string {
  const label = plainText(action.label);
  const shortcut = action.shortcut === undefined ? '' : ` ${c.shortcutLeft}${plainText(action.shortcut)}${c.shortcutRight}`;
  const reason = action.disabledReason === undefined ? '' : `: ${plainText(action.disabledReason)}`;
  const body = `${label}${shortcut}${action.disabled ? reason : ''}`;

  if (action.disabled) {return `${c.disabledLeft}${body}${c.disabledRight}`;}

  if (action.id === activeId) {return `${c.activeLeft}${body}${c.activeRight}`;}

  return body;
}

/** Lays out actions from left to right and appends an overflow marker when needed. */
export function renderActionBarModel<TAction extends ActionBarAction>({
  actions,
  activeId,
  characters = ACTION_BAR_UNICODE_CHARACTERS,
  pad = false,
  width,
}: RenderActionBarOptions<TAction>): ActionBarRenderResult {
  if (!Number.isInteger(width) || width < 0) {throw new RangeError('ActionBar width must be a non-negative integer.');}

  actions.forEach(assertAction);

  if (width === 0) {return { content: '', visibleActionIds: [] };}

  const parts: string[] = [];
  const ids: string[] = [];

  let used = 0;

  for (const action of actions) {
    const actionText = renderAction(action, activeId, characters);
    const prefix = parts.length === 0 ? '' : action.separator ? ` ${characters.separator} ` : '  ';
    const candidateWidth = visibleWidth(prefix) + visibleWidth(actionText);
    const remaining = actions.length - ids.length - 1;
    const reserve = remaining > 0 ? visibleWidth(` ${characters.overflow}`) : 0;

    if (used + candidateWidth + reserve > width) {break;}

    parts.push(`${prefix}${actionText}`);
    ids.push(action.id);
    used += candidateWidth;
  }

  let content = parts.join('');

  if (ids.length < actions.length) {
    const overflow = plainText(characters.overflow);

    content = truncateText(`${content}${content.length > 0 ? ' ' : ''}${overflow}`, width);
  }

  if (pad) {content += ' '.repeat(Math.max(0, width - visibleWidth(content)));}

  return { content, visibleActionIds: ids };
}

/** Renders a width-aware, single-line collection of application actions. */
export function renderActionBar<TAction extends ActionBarAction>(options: RenderActionBarOptions<TAction>): string {
  return renderActionBarModel(options).content;
}
