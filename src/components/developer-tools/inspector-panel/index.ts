import { type KeyValueItem, renderKeyValue } from '@/components/data-display/key-value/index.js';
import { type ActionBarAction, renderActionBar } from '@/components/navigation/action-bar/index.js';
import { renderTabs, type TabItem } from '@/components/navigation/tabs/index.js';
import { fitPlain, plain } from '@/components/shared/text.js';

/** One InspectorPanel tab and its caller-rendered content. */
export interface InspectorPanelTab extends TabItem {
  content: string;
}
/** One contextual action exposed by InspectorPanel. */
export type InspectorPanelAction = ActionBarAction;

/** Options accepted by {@link renderInspectorPanel}. */
export interface RenderInspectorPanelOptions<
  TTab extends InspectorPanelTab = InspectorPanelTab,
  TAction extends InspectorPanelAction = InspectorPanelAction,
> {
  actions?: readonly TAction[];
  activeActionId?: string;
  activeTabId?: string;
  focusedTabId?: string;
  height?: number;
  metadata?: readonly KeyValueItem[];
  subtitle?: string;
  tabs: readonly TTab[];
  title: string;
  width: number;
}

function oneLine(value: string): string {
  return plain(value)
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

/** Renders an opinionated inspection surface with heading, metadata, tabs, body, and actions. */
export function renderInspectorPanel<
  TTab extends InspectorPanelTab,
  TAction extends InspectorPanelAction,
>({
  actions = [],
  activeActionId,
  activeTabId,
  focusedTabId,
  height,
  metadata = [],
  subtitle,
  tabs,
  title,
  width,
}: RenderInspectorPanelOptions<TTab, TAction>): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('InspectorPanel dimensions must be non-negative integers.');
  }

  const safeTitle = oneLine(title);

  if (safeTitle.length === 0) {
    throw new RangeError('InspectorPanel title must be non-empty.');
  }

  const active =
    tabs.find(({ id, disabled }) => id === activeTabId && disabled !== true) ??
    tabs.find(({ disabled }) => disabled !== true);
  const lines = [
    `# ${safeTitle}${subtitle === undefined || oneLine(subtitle).length === 0 ? '' : ` - ${oneLine(subtitle)}`}`,
  ];

  if (metadata.length > 0) {
    lines.push(renderKeyValue({ items: metadata, layout: 'inline' }));
  }

  if (tabs.length > 0) {
    lines.push(
      renderTabs({
        ...(active?.id === undefined ? {} : { activeId: active.id }),
        ...(focusedTabId === undefined ? {} : { focusedId: focusedTabId }),
        items: tabs,
        width,
      }),
    );
  }

  if (active !== undefined) {
    lines.push(...plain(active.content).split('\n'));
  }

  if (actions.length > 0) {
    lines.push(
      renderActionBar({
        actions,
        ...(activeActionId === undefined ? {} : { activeId: activeActionId }),
        width,
      }),
    );
  }

  const fitted = lines.map((line) => fitPlain(line, width));

  return (height === undefined ? fitted : fitted.slice(0, height)).join('\n');
}
