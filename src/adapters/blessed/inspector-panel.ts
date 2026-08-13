import blessed from 'blessed';
import {
  type InspectorPanelAction,
  type InspectorPanelTab,
  renderInspectorPanel,
} from '@/components/developer-tools/inspector-panel/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import type { BlessedComponentHandle } from './types.js';

export type InspectorPanelBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export interface InspectorPanelData<
  TTab extends InspectorPanelTab = InspectorPanelTab,
  TAction extends InspectorPanelAction = InspectorPanelAction,
> {
  actions?: readonly TAction[];
  activeActionId?: string;
  metadata?: RenderInspectorPanelMetadata;
  onAction?: (action: TAction) => void;
  onTabChange?: (id: string) => void;
  subtitle?: string;
  tabs: readonly TTab[];
  title: string;
  value?: string;
}
type RenderInspectorPanelMetadata = readonly { key: string; value: number | string }[];
export interface InspectorPanelOptions<
  TTab extends InspectorPanelTab = InspectorPanelTab,
  TAction extends InspectorPanelAction = InspectorPanelAction,
> {
  box?: InspectorPanelBoxOptions;
  data: InspectorPanelData<TTab, TAction>;
  parent: blessed.Widgets.Node;
}
export interface InspectorPanelHandle<
  TTab extends InspectorPanelTab = InspectorPanelTab,
  TAction extends InspectorPanelAction = InspectorPanelAction,
> extends BlessedComponentHandle<InspectorPanelData<TTab, TAction>, blessed.Widgets.BoxElement> {
  activateAction(id: string): TAction | undefined;
  activeTabId(): string | undefined;
  firstTab(): string | undefined;
  focus(): void;
  focusTab(id: string): string | undefined;
  lastTab(): string | undefined;
  nextTab(): string | undefined;
  previousTab(): string | undefined;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive InspectorPanel backed by a Blessed box. */
export function inspectorPanel<
  TTab extends InspectorPanelTab,
  TAction extends InspectorPanelAction,
>({
  box,
  data: initialData,
  parent,
}: InspectorPanelOptions<TTab, TAction>): InspectorPanelHandle<TTab, TAction> {
  let data = initialData;
  let scope = createFocusScope({ items: data.tabs });
  let active = data.value;

  const element = blessed.box({
    keys: true,
    mouse: true,
    scrollable: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const render = () =>
    element.setContent(
      renderInspectorPanel({
        ...(data.actions === undefined ? {} : { actions: data.actions }),
        ...(data.activeActionId === undefined ? {} : { activeActionId: data.activeActionId }),
        ...(active === undefined ? {} : { activeTabId: active, focusedTabId: active }),
        height: Math.max(0, dimension(element.height) - dimension(element.iheight)),
        ...(data.metadata === undefined ? {} : { metadata: data.metadata }),
        ...(data.subtitle === undefined ? {} : { subtitle: data.subtitle }),
        tabs: data.tabs,
        title: data.title,
        width: Math.max(0, dimension(element.width) - dimension(element.iwidth)),
      }),
    );
  const select = (id: string | undefined) => {
    if (id !== undefined && id !== active) {
      active = id;
      data.onTabChange?.(id);
      render();
    }

    return active;
  };

  scope.activate();
  active = scope.focus(active ?? '') ?? scope.current();
  render();
  const handle: InspectorPanelHandle<TTab, TAction> = {
    activateAction(id) {
      const action = (data.actions ?? []).find((item) => item.id === id && item.disabled !== true);

      if (action) {
        data.onAction?.(action);
      }

      return action;
    },
    activeTabId: () => active,
    destroy: () => element.destroy(),
    element,
    firstTab: () => select(data.tabs.find(({ disabled }) => disabled !== true)?.id),
    focus: () => element.focus(),
    focusTab: (id) => select(scope.focus(id)),
    lastTab: () => select([...data.tabs].reverse().find(({ disabled }) => disabled !== true)?.id),
    nextTab: () => select(scope.next()),
    previousTab: () => select(scope.previous()),
    setData(nextData) {
      const previous = active;

      data = nextData;
      scope = createFocusScope({
        ...(data.value === undefined ? {} : { initialFocusId: data.value }),
        items: data.tabs,
      });
      scope.activate();
      active =
        data.value ??
        (previous === undefined ? scope.current() : (scope.focus(previous) ?? scope.current()));
      render();
    },
  };

  element.on('keypress', (_character: string, key: { full?: string; name?: string }) => {
    switch (key.full ?? key.name) {
      case 'left':
      case 'shift-tab':
        handle.previousTab();
        break;
      case 'right':
      case 'tab':
        handle.nextTab();
        break;
      case 'home':
        handle.firstTab();
        break;
      case 'end':
        handle.lastTab();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
