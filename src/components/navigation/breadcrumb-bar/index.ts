import {
  type BreadcrumbItem,
  renderBreadcrumb,
} from '@/components/data-display/breadcrumb/index.js';
import {
  ACTION_BAR_ASCII_CHARACTERS,
  ACTION_BAR_UNICODE_CHARACTERS,
  type ActionBarAction,
  type ActionBarCharacters,
  renderActionBarModel,
} from '@/components/navigation/action-bar/index.js';
import { plain } from '@/components/shared/text.js';
import { truncateText } from '@/core/truncate.js';
import { visibleWidth } from '@/core/width.js';

/** One adjacent resource reachable from a BreadcrumbBar. */
export interface BreadcrumbBarSibling {
  /** Whether the sibling cannot be activated. */
  disabled?: boolean;
  /** Stable sibling identifier. */
  id: string;
  /** Human-readable sibling label. */
  label: string;
}

/** One contextual BreadcrumbBar command. */
export type BreadcrumbBarAction = ActionBarAction;

/** Focusable control in a BreadcrumbBar. */
export type BreadcrumbBarTarget = 'next' | 'previous' | `action:${string}`;

/** Character tokens used by {@link renderBreadcrumbBar}. */
export interface BreadcrumbBarCharacters {
  action: ActionBarCharacters;
  activeLeft: string;
  activeRight: string;
  next: string;
  previous: string;
  sectionSeparator: string;
}

export const BREADCRUMB_BAR_UNICODE_CHARACTERS: Readonly<BreadcrumbBarCharacters> = Object.freeze({
  action: ACTION_BAR_UNICODE_CHARACTERS,
  activeLeft: '▸',
  activeRight: '◂',
  next: '›',
  previous: '‹',
  sectionSeparator: '│',
});

export const BREADCRUMB_BAR_ASCII_CHARACTERS: Readonly<BreadcrumbBarCharacters> = Object.freeze({
  action: ACTION_BAR_ASCII_CHARACTERS,
  activeLeft: '>',
  activeRight: '<',
  next: '>',
  previous: '<',
  sectionSeparator: '|',
});

/** Options accepted by {@link renderBreadcrumbBar}. */
export interface RenderBreadcrumbBarOptions<
  TAction extends BreadcrumbBarAction = BreadcrumbBarAction,
> {
  actions?: readonly TAction[];
  activeTarget?: BreadcrumbBarTarget;
  characters?: BreadcrumbBarCharacters;
  /** Ordered location path. */
  items: readonly BreadcrumbItem[];
  nextSibling?: BreadcrumbBarSibling;
  pad?: boolean;
  previousSibling?: BreadcrumbBarSibling;
  separator?: string;
  width: number;
}

/** Responsive layout result used by the Blessed adapter. */
export interface BreadcrumbBarRenderResult {
  content: string;
  visibleActionIds: readonly string[];
  visibleTargets: readonly BreadcrumbBarTarget[];
}

function oneLine(value: string): string {
  return plain(value)
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

function siblingText(
  sibling: BreadcrumbBarSibling,
  direction: 'next' | 'previous',
  activeTarget: BreadcrumbBarTarget | undefined,
  characters: BreadcrumbBarCharacters,
): string {
  const body =
    direction === 'previous'
      ? `${characters.previous} ${oneLine(sibling.label)}`
      : `${oneLine(sibling.label)} ${characters.next}`;

  return activeTarget === direction
    ? `${characters.activeLeft}${body}${characters.activeRight}`
    : sibling.disabled
      ? `(${body})`
      : body;
}

/** Lays out a location path, adjacent-resource navigation, and contextual actions. */
export function renderBreadcrumbBarModel<TAction extends BreadcrumbBarAction>({
  actions = [],
  activeTarget,
  characters = BREADCRUMB_BAR_UNICODE_CHARACTERS,
  items,
  nextSibling,
  pad = true,
  previousSibling,
  separator = ' / ',
  width,
}: RenderBreadcrumbBarOptions<TAction>): BreadcrumbBarRenderResult {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('BreadcrumbBar width must be a non-negative integer.');
  }

  const siblingIds = new Set<string>();

  for (const sibling of [previousSibling, nextSibling]) {
    if (sibling === undefined) {
      continue;
    }

    if (oneLine(sibling.id).length === 0 || oneLine(sibling.label).length === 0) {
      throw new RangeError('BreadcrumbBar sibling ids and labels must be non-empty.');
    }

    if (siblingIds.has(sibling.id)) {
      throw new RangeError(`BreadcrumbBar sibling ids must be unique: ${sibling.id}.`);
    }

    siblingIds.add(sibling.id);
  }

  // Validate path and actions even when no cells are available.
  renderBreadcrumb({ items, separator, width: 0 });
  renderActionBarModel({ actions, characters: characters.action, width: 0 });

  if (width === 0) {
    return { content: '', visibleActionIds: [], visibleTargets: [] };
  }

  const siblingSegments = [
    previousSibling === undefined
      ? undefined
      : { sibling: previousSibling, target: 'previous' as const },
    nextSibling === undefined ? undefined : { sibling: nextSibling, target: 'next' as const },
  ].filter((value): value is NonNullable<typeof value> => value !== undefined);
  const sectionSeparator = ` ${characters.sectionSeparator} `;
  const minimumPathWidth = items.length === 0 ? 0 : Math.min(width, 3);
  const availableRight = Math.max(
    0,
    width - minimumPathWidth - (minimumPathWidth > 0 ? visibleWidth(sectionSeparator) : 0),
  );
  const visibleTargets: BreadcrumbBarTarget[] = [];
  const siblingParts: string[] = [];

  let rightUsed = 0;

  for (const { sibling, target } of siblingSegments) {
    const text = siblingText(sibling, target, activeTarget, characters);
    const prefix = siblingParts.length === 0 ? '' : '  ';

    if (rightUsed + visibleWidth(prefix) + visibleWidth(text) > availableRight) {
      break;
    }

    siblingParts.push(`${prefix}${text}`);
    rightUsed += visibleWidth(prefix) + visibleWidth(text);

    if (!sibling.disabled) {
      visibleTargets.push(target);
    }
  }

  const actionSpace = Math.max(
    0,
    availableRight -
      rightUsed -
      (rightUsed > 0 && actions.length > 0 ? visibleWidth(sectionSeparator) : 0),
  );
  const activeActionId = activeTarget?.startsWith('action:') ? activeTarget.slice(7) : undefined;
  const actionModel = renderActionBarModel({
    actions,
    ...(activeActionId === undefined ? {} : { activeId: activeActionId }),
    characters: characters.action,
    width: actionSpace,
  });

  visibleTargets.push(...actionModel.visibleActionIds.map((id) => `action:${id}` as const));

  const rightSections = [siblingParts.join(''), actionModel.content].filter(
    (part) => part.length > 0,
  );
  const right = rightSections.join(sectionSeparator);
  const pathWidth = Math.max(
    0,
    width - visibleWidth(right) - (right.length > 0 ? visibleWidth(sectionSeparator) : 0),
  );
  const path = renderBreadcrumb({ items, separator, width: pathWidth });

  let content =
    path.length === 0 ? right : right.length === 0 ? path : `${path}${sectionSeparator}${right}`;

  content = truncateText(content, width);

  if (pad) {
    content += ' '.repeat(Math.max(0, width - visibleWidth(content)));
  }

  return { content, visibleActionIds: actionModel.visibleActionIds, visibleTargets };
}

/** Renders a width-aware breadcrumb navigation surface. */
export function renderBreadcrumbBar<TAction extends BreadcrumbBarAction>(
  options: RenderBreadcrumbBarOptions<TAction>,
): string {
  return renderBreadcrumbBarModel(options).content;
}
