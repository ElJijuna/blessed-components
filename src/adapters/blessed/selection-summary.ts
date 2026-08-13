import blessed from 'blessed';

import {
  ACTION_BAR_ASCII_CHARACTERS,
  ACTION_BAR_UNICODE_CHARACTERS,
  type ActionBarCharacters,
} from '@/components/navigation/action-bar/index.js';
import {
  renderSelectionSummary,
  type SelectionSummaryAction,
} from '@/components/navigation/selection-summary/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import type { BlessedComponentHandle } from './types.js';

export type SelectionSummaryBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;

export interface SelectionSummaryData<
  TAction extends SelectionSummaryAction = SelectionSummaryAction,
> {
  actions?: readonly TAction[];
  activeActionId?: string;
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;
  characters?: ActionBarCharacters;
  detail?: string;
  noun?: string;
  onAction?: (action: TAction) => void;
  onActiveActionIdChange?: (id: string) => void;
  selectedCount: number;
  totalCount?: number;
  width?: number;
}

export interface SelectionSummaryOptions<
  TAction extends SelectionSummaryAction = SelectionSummaryAction,
> {
  box?: SelectionSummaryBoxOptions;
  data: SelectionSummaryData<TAction>;
  parent: blessed.Widgets.Node;
}

export interface SelectionSummaryHandle<
  TAction extends SelectionSummaryAction = SelectionSummaryAction,
> extends BlessedComponentHandle<SelectionSummaryData<TAction>, blessed.Widgets.BoxElement> {
  activateActive(): TAction | undefined;
  activeActionId(): string | undefined;
  first(): string | undefined;
  focus(): void;
  focusAction(id: string): string | undefined;
  last(): string | undefined;
  next(): string | undefined;
  previous(): string | undefined;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive SelectionSummary backed by a Blessed box. */
export function selectionSummary<TAction extends SelectionSummaryAction>({
  box,
  data: initialData,
  parent,
}: SelectionSummaryOptions<TAction>): SelectionSummaryHandle<TAction> {
  let data = initialData;
  let actions = data.actions ?? [];
  let scope = createFocusScope({ items: actions });
  let active = data.activeActionId;

  const element = blessed.box({
    height: 1,
    keys: true,
    mouse: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const innerWidth = () =>
    data.width ?? Math.max(0, dimension(element.width) - dimension(element.iwidth));
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderSelectionSummary({
        actions,
        ...(active === undefined ? {} : { activeActionId: active }),
        characters:
          data.characters ??
          (capabilities.unicode ? ACTION_BAR_UNICODE_CHARACTERS : ACTION_BAR_ASCII_CHARACTERS),
        ...(data.detail === undefined ? {} : { detail: data.detail }),
        ...(data.noun === undefined ? {} : { noun: data.noun }),
        selectedCount: data.selectedCount,
        ...(data.totalCount === undefined ? {} : { totalCount: data.totalCount }),
        width: innerWidth(),
      }),
    );
  };
  const setActive = (id: string | undefined) => {
    if (id !== undefined && id !== active) {
      active = id;
      data.onActiveActionIdChange?.(id);
      render();
    }

    return active;
  };
  const enabledAt = (fromEnd = false) =>
    (fromEnd ? [...actions].reverse() : actions).find(({ disabled }) => disabled !== true)?.id;

  scope.activate();
  active = data.selectedCount === 0 ? undefined : (scope.focus(active ?? '') ?? scope.current());
  render();

  const handle: SelectionSummaryHandle<TAction> = {
    activateActive() {
      if (data.selectedCount === 0) {
        return undefined;
      }

      const action = actions.find(({ disabled, id }) => id === active && disabled !== true);

      if (action) {
        data.onAction?.(action);
      }

      return action;
    },
    activeActionId: () => active,
    destroy: () => element.destroy(),
    element,
    first: () => setActive(enabledAt()),
    focus: () => element.focus(),
    focusAction: (id) => setActive(scope.focus(id)),
    last: () => setActive(enabledAt(true)),
    next: () => setActive(scope.next()),
    previous: () => setActive(scope.previous()),
    setData(nextData) {
      const previous = active;

      data = nextData;
      actions = data.actions ?? [];
      scope = createFocusScope({
        ...(data.activeActionId ? { initialFocusId: data.activeActionId } : {}),
        items: actions,
      });
      scope.activate();
      active =
        data.selectedCount === 0
          ? undefined
          : data.activeActionId === undefined && previous !== undefined
            ? (scope.focus(previous) ?? scope.current())
            : scope.current();
      render();
    },
  };

  element.on('keypress', (_character: string, key: { full?: string; name?: string }) => {
    switch (key.full ?? key.name) {
      case 'left':
      case 'shift-tab':
        handle.previous();
        break;
      case 'right':
      case 'tab':
        handle.next();
        break;
      case 'home':
        handle.first();
        break;
      case 'end':
        handle.last();
        break;
      case 'enter':
      case 'space':
        handle.activateActive();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
