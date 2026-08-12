import blessed from 'blessed';

import {
  ACTION_BAR_ASCII_CHARACTERS,
  ACTION_BAR_UNICODE_CHARACTERS,
  type ActionBarAction,
  type ActionBarCharacters,
  renderActionBarModel,
} from '@/components/navigation/action-bar/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { visibleWidth } from '@/core/width.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import type { BlessedComponentHandle } from './types.js';

export type ActionBarBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

export interface ActionBarData<TAction extends ActionBarAction = ActionBarAction> {
  actions: readonly TAction[];
  activeId?: string;
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;
  characters?: ActionBarCharacters;
  onAction?: (action: TAction) => void;
  onActiveIdChange?: (id: string) => void;
  width?: number;
}

export interface ActionBarOptions<TAction extends ActionBarAction = ActionBarAction> {
  box?: ActionBarBoxOptions;
  data: ActionBarData<TAction>;
  parent: blessed.Widgets.Node;
}

export interface ActionBarHandle<TAction extends ActionBarAction = ActionBarAction>
  extends BlessedComponentHandle<ActionBarData<TAction>, blessed.Widgets.BoxElement> {
  activateActive(): TAction | undefined;
  activeId(): string | undefined;
  first(): string | undefined;
  focus(): void;
  focusAction(id: string): string | undefined;
  last(): string | undefined;
  next(): string | undefined;
  previous(): string | undefined;
}

interface Keypress { full?: string; name?: string }
interface MouseEvent { x?: number }

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive horizontal ActionBar backed by a Blessed box. */
export function actionBar<TAction extends ActionBarAction>({ box, data: initialData, parent }: ActionBarOptions<TAction>): ActionBarHandle<TAction> {
  let data = initialData;
  let active = initialData.activeId;
  let visibleIds: readonly string[] = [];
  let scope = createFocusScope({ items: data.actions });

  const element = blessed.box({ height: 1, keys: true, mouse: true, ...box, content: '', parent, tags: false });
  const innerWidth = () => data.width ?? Math.max(0, dimension(element.width) - dimension(element.iwidth));
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();
    const model = renderActionBarModel({
      actions: data.actions,
      ...(active === undefined ? {} : { activeId: active }),
      characters: data.characters ?? (capabilities.unicode ? ACTION_BAR_UNICODE_CHARACTERS : ACTION_BAR_ASCII_CHARACTERS),
      width: innerWidth(),
    });

    visibleIds = model.visibleActionIds;
    element.setContent(model.content);
  };
  const setActive = (id: string | undefined) => {
    if (id !== undefined && id !== active) { active = id; data.onActiveIdChange?.(id); render(); }

    return active;
  };
  const enabledAt = (fromEnd = false): string | undefined => {
    const ordered = fromEnd ? [...data.actions].reverse() : data.actions;

    return ordered.find(({ disabled }) => disabled !== true)?.id;
  };

  scope.activate();
  active = scope.focus(active ?? '') ?? scope.current();
  render();

  const handle: ActionBarHandle<TAction> = {
    activateActive() {
      const action = data.actions.find(({ disabled, id }) => id === active && disabled !== true);

      if (action) {data.onAction?.(action);}

      return action;
    },
    activeId: () => active,
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
      scope = createFocusScope({ ...(data.activeId ? { initialFocusId: data.activeId } : {}), items: data.actions });
      scope.activate();
      active = data.activeId === undefined && previous !== undefined ? scope.focus(previous) ?? scope.current() : scope.current();
      render();
    },
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'left': case 'shift-tab': handle.previous(); break;
      case 'right': case 'tab': handle.next(); break;
      case 'home': handle.first(); break;
      case 'end': handle.last(); break;
      case 'enter': case 'space': handle.activateActive(); break;
    }
  });
  element.on('click', (event: MouseEvent) => {
    if (event.x === undefined) {return;}

    const localX = event.x - dimension((element as blessed.Widgets.BoxElement & { aleft?: blessed.Widgets.Types.TPosition }).aleft ?? element.left) - dimension(element.ileft);

    let cursor = 0;

    for (const id of visibleIds) {
      const action = data.actions.find((candidate) => candidate.id === id);

      if (!action) {continue;}

      const text = renderActionBarModel({ actions: [action], activeId: id, characters: data.characters ?? ACTION_BAR_UNICODE_CHARACTERS, width: innerWidth() }).content;
      const end = cursor + visibleWidth(text) + 2;

      if (localX >= cursor && localX < end && !action.disabled) { handle.focusAction(id); handle.activateActive();

 return; }

      cursor = end;
    }
  });
  element.on('resize', render);

  return handle;
}
