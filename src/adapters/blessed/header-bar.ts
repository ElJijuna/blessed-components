import blessed from 'blessed';
import {
  ACTION_BAR_ASCII_CHARACTERS,
  ACTION_BAR_UNICODE_CHARACTERS,
} from '@/components/navigation/action-bar/index.js';
import {
  type HeaderBarAction,
  type RenderHeaderBarOptions,
  renderHeaderBar,
} from '@/components/navigation/header-bar/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

export type HeaderBarBoxOptions = BoxElementOptions;
export interface HeaderBarData<TAction extends HeaderBarAction = HeaderBarAction>
  extends Omit<RenderHeaderBarOptions<TAction>, 'characters' | 'width'>,
    BoxData {
  activeActionId?: string;
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;
  onAction?: (action: TAction) => void;
  onActiveActionIdChange?: (id: string) => void;
  width?: number;
}
export interface HeaderBarOptions<TAction extends HeaderBarAction = HeaderBarAction> {
  box?: HeaderBarBoxOptions;
  data: HeaderBarData<TAction>;
  parent: blessed.Widgets.Node;
}
export interface HeaderBarHandle<TAction extends HeaderBarAction = HeaderBarAction>
  extends BlessedComponentHandle<HeaderBarData<TAction>, blessed.Widgets.BoxElement> {
  activateActive(): TAction | undefined;
  activeActionId(): string | undefined;
  first(): string | undefined;
  focus(): void;
  last(): string | undefined;
  next(): string | undefined;
  previous(): string | undefined;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive top-aligned HeaderBar. */
export function headerBar<TAction extends HeaderBarAction>({
  box,
  data: initialData,
  parent,
}: HeaderBarOptions<TAction>): HeaderBarHandle<TAction> {
  let data = initialData;
  let actions = data.actions ?? [];
  let scope = createFocusScope({ items: actions });
  let active = data.activeActionId;

  const element = blessed.box({
    height: 1,
    left: 0,
    right: 0,
    top: 0,
    keys: true,
    mouse: true,
    ...box,
    content: '',
    parent,
    style: { ...box?.style, border: { ...box?.style?.border } },
    tags: false,
  });
  const style = createBoxStyleController(element, box, {}, { component: 'header-bar' });
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderHeaderBar({
        ...data,
        actions,
        ...(active === undefined ? {} : { activeActionId: active }),
        characters: capabilities.unicode
          ? ACTION_BAR_UNICODE_CHARACTERS
          : ACTION_BAR_ASCII_CHARACTERS,
        width: data.width ?? Math.max(0, dimension(element.width) - dimension(element.iwidth)),
      }),
    );
    style.apply({
      backgroundTone: data.backgroundTone,
      borderTone: data.borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: data.foregroundTone,
      theme: data.theme,
    });
  };
  const setActive = (id: string | undefined) => {
    if (id !== undefined && id !== active) {
      active = id;
      data.onActiveActionIdChange?.(id);
      render();
    }

    return active;
  };

  scope.activate();
  active = scope.focus(active ?? '') ?? scope.current();
  render();
  const enabled = (reverse = false) =>
    (reverse ? [...actions].reverse() : actions).find(({ disabled }) => disabled !== true)?.id;
  const handle: HeaderBarHandle<TAction> = {
    activateActive() {
      const action = actions.find(({ disabled, id }) => id === active && disabled !== true);

      if (action) {
        data.onAction?.(action);
      }

      return action;
    },
    activeActionId: () => active,
    destroy: () => element.destroy(),
    element,
    first: () => setActive(enabled()),
    focus: () => element.focus(),
    last: () => setActive(enabled(true)),
    next: () => setActive(scope.next()),
    previous: () => setActive(scope.previous()),
    setData(nextData) {
      const previous = active;

      data = nextData;
      actions = data.actions ?? [];
      scope = createFocusScope({
        ...(data.activeActionId === undefined ? {} : { initialFocusId: data.activeActionId }),
        items: actions,
      });
      scope.activate();
      active =
        data.activeActionId ??
        (previous === undefined ? scope.current() : (scope.focus(previous) ?? scope.current()));
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
