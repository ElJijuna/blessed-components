import {
  ACTION_BAR_UNICODE_CHARACTERS,
  type ActionBarAction,
  type ActionBarCharacters,
  renderActionBarModel,
} from '@/components/navigation/action-bar/index.js';
import { plain } from '@/components/shared/text.js';
import { truncateText } from '@/core/truncate.js';
import { visibleWidth } from '@/core/width.js';

/** Primary application status shown by HeaderBar. */
export interface HeaderBarStatus {
  label: string;
  marker?: string;
}
/** One contextual HeaderBar action. */
export type HeaderBarAction = ActionBarAction;
/** Options accepted by {@link renderHeaderBar}. */
export interface RenderHeaderBarOptions<TAction extends HeaderBarAction = HeaderBarAction> {
  actions?: readonly TAction[];
  activeActionId?: string;
  characters?: ActionBarCharacters;
  environment?: string;
  pad?: boolean;
  status?: HeaderBarStatus;
  title: string;
  width: number;
  workspace?: string;
}
/** Responsive render result. */
export interface HeaderBarRenderResult {
  content: string;
  visibleActionIds: readonly string[];
}

function oneLine(value: string): string {
  return plain(value)
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

/** Lays out app identity, workspace/environment, status, and contextual actions. */
export function renderHeaderBarModel<TAction extends HeaderBarAction>({
  actions = [],
  activeActionId,
  characters = ACTION_BAR_UNICODE_CHARACTERS,
  environment,
  pad = true,
  status,
  title,
  width,
  workspace,
}: RenderHeaderBarOptions<TAction>): HeaderBarRenderResult {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('HeaderBar width must be a non-negative integer.');
  }

  const safeTitle = oneLine(title);

  if (safeTitle.length === 0) {
    throw new RangeError('HeaderBar title must be non-empty.');
  }

  const context = [workspace, environment]
    .filter((item): item is string => item !== undefined && oneLine(item).length > 0)
    .map(oneLine)
    .join(' / ');
  const statusText =
    status === undefined
      ? ''
      : `${status.marker === undefined ? '' : `${oneLine(status.marker)} `}${oneLine(status.label)}`;

  if (status !== undefined && oneLine(status.label).length === 0) {
    throw new RangeError('HeaderBar status labels must be non-empty.');
  }

  const left = `${safeTitle}${context.length === 0 ? '' : ` · ${context}`}${statusText.length === 0 ? '' : ` · ${statusText}`}`;

  if (actions.length === 0 || width === 0) {
    const content = truncateText(left, width);

    return {
      content: pad
        ? `${content}${' '.repeat(Math.max(0, width - visibleWidth(content)))}`
        : content,
      visibleActionIds: [],
    };
  }

  const actionWidth = Math.max(0, width - visibleWidth(left) - 1);
  const actionModel = renderActionBarModel({
    actions,
    ...(activeActionId === undefined ? {} : { activeId: activeActionId }),
    characters,
    width: actionWidth,
  });

  let content =
    actionModel.content.length === 0
      ? truncateText(left, width)
      : `${truncateText(left, Math.max(0, width - visibleWidth(actionModel.content) - 1))}${' '.repeat(Math.max(1, width - Math.min(visibleWidth(left), width - visibleWidth(actionModel.content) - 1) - visibleWidth(actionModel.content)))}${actionModel.content}`;

  content = truncateText(content, width);

  if (pad) {
    content += ' '.repeat(Math.max(0, width - visibleWidth(content)));
  }

  return { content, visibleActionIds: actionModel.visibleActionIds };
}

export function renderHeaderBar<TAction extends HeaderBarAction>(
  options: RenderHeaderBarOptions<TAction>,
): string {
  return renderHeaderBarModel(options).content;
}
