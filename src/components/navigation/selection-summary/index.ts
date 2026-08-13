import {
  ACTION_BAR_UNICODE_CHARACTERS,
  type ActionBarAction,
  type ActionBarCharacters,
  renderActionBarModel,
} from '@/components/navigation/action-bar/index.js';
import { plain } from '@/components/shared/text.js';
import { truncateText } from '@/core/truncate.js';
import { visibleWidth } from '@/core/width.js';

/** A bulk action exposed by SelectionSummary. */
export type SelectionSummaryAction = ActionBarAction;

/** Options accepted by {@link renderSelectionSummary}. */
export interface RenderSelectionSummaryOptions<
  TAction extends SelectionSummaryAction = SelectionSummaryAction,
> {
  actions?: readonly TAction[];
  activeActionId?: string;
  characters?: ActionBarCharacters;
  /** Optional context appended after the selection count. */
  detail?: string;
  /** Singular noun for a selected value. @defaultValue `'item'` */
  noun?: string;
  /** Number of selected items. */
  selectedCount: number;
  /** Total selectable items, when known. */
  totalCount?: number;
  width: number;
}

/** Rendered summary plus actions visible after width clipping. */
export interface SelectionSummaryRenderResult {
  content: string;
  visibleActionIds: readonly string[];
}

function assertCount(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`SelectionSummary ${name} must be a non-negative integer.`);
  }
}

function summaryText({
  detail,
  noun = 'item',
  selectedCount,
  totalCount,
}: Pick<
  RenderSelectionSummaryOptions,
  'detail' | 'noun' | 'selectedCount' | 'totalCount'
>): string {
  const safeNoun = plain(noun)
    .replace(/[\r\n]+/gu, ' ')
    .trim();

  if (safeNoun.length === 0) {
    throw new RangeError('SelectionSummary noun must be non-empty.');
  }

  const count = totalCount === undefined ? `${selectedCount}` : `${selectedCount} of ${totalCount}`;
  const label = selectedCount === 1 ? safeNoun : `${safeNoun}s`;
  const context =
    detail === undefined
      ? ''
      : ` · ${plain(detail)
          .replace(/[\r\n]+/gu, ' ')
          .trim()}`;

  return `${count} ${label} selected${context}`;
}

/** Lays out selection context and bulk actions on one bounded line. */
export function renderSelectionSummaryModel<TAction extends SelectionSummaryAction>({
  actions = [],
  activeActionId,
  characters = ACTION_BAR_UNICODE_CHARACTERS,
  detail,
  noun = 'item',
  selectedCount,
  totalCount,
  width,
}: RenderSelectionSummaryOptions<TAction>): SelectionSummaryRenderResult {
  assertCount(selectedCount, 'selectedCount');

  if (totalCount !== undefined) {
    assertCount(totalCount, 'totalCount');

    if (selectedCount > totalCount) {
      throw new RangeError('SelectionSummary selectedCount cannot exceed totalCount.');
    }
  }

  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('SelectionSummary width must be a non-negative integer.');
  }

  const summary = summaryText({
    ...(detail === undefined ? {} : { detail }),
    noun,
    selectedCount,
    ...(totalCount === undefined ? {} : { totalCount }),
  });
  const availableActions =
    selectedCount === 0 ? actions.map((action) => ({ ...action, disabled: true })) : actions;

  if (width === 0 || availableActions.length === 0) {
    return { content: truncateText(summary, width), visibleActionIds: [] };
  }

  const separator = ` ${characters.separator} `;
  const actionWidth = Math.max(0, width - visibleWidth(summary) - visibleWidth(separator));
  const actionModel = renderActionBarModel({
    actions: availableActions,
    ...(activeActionId === undefined ? {} : { activeId: activeActionId }),
    characters,
    width: actionWidth,
  });
  const content =
    actionModel.content.length === 0
      ? truncateText(summary, width)
      : truncateText(`${summary}${separator}${actionModel.content}`, width);

  return { content, visibleActionIds: actionModel.visibleActionIds };
}

/** Renders selected-item context with width-aware bulk action affordances. */
export function renderSelectionSummary<TAction extends SelectionSummaryAction>(
  options: RenderSelectionSummaryOptions<TAction>,
): string {
  return renderSelectionSummaryModel(options).content;
}
