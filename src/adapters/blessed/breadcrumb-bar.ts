import blessed from 'blessed';
import {
  BREADCRUMB_BAR_ASCII_CHARACTERS,
  BREADCRUMB_BAR_UNICODE_CHARACTERS,
  type BreadcrumbBarAction,
  type BreadcrumbBarSibling,
  type BreadcrumbBarTarget,
  type RenderBreadcrumbBarOptions,
  renderBreadcrumbBar,
} from '@/components/navigation/breadcrumb-bar/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

export type BreadcrumbBarBoxOptions = BoxElementOptions;

export interface BreadcrumbBarData<TAction extends BreadcrumbBarAction = BreadcrumbBarAction>
  extends Omit<RenderBreadcrumbBarOptions<TAction>, 'activeTarget' | 'characters' | 'width'>,
    BoxData {
  activeTarget?: BreadcrumbBarTarget;
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;
  onAction?: (action: TAction) => void;
  onNavigateSibling?: (sibling: BreadcrumbBarSibling, direction: 'next' | 'previous') => void;
  onActiveTargetChange?: (target: BreadcrumbBarTarget) => void;
  width?: number;
}

export interface BreadcrumbBarOptions<TAction extends BreadcrumbBarAction = BreadcrumbBarAction> {
  box?: BreadcrumbBarBoxOptions;
  data: BreadcrumbBarData<TAction>;
  parent: blessed.Widgets.Node;
}

export interface BreadcrumbBarHandle<TAction extends BreadcrumbBarAction = BreadcrumbBarAction>
  extends BlessedComponentHandle<BreadcrumbBarData<TAction>, blessed.Widgets.BoxElement> {
  activateActive(): BreadcrumbBarSibling | TAction | undefined;
  activeTarget(): BreadcrumbBarTarget | undefined;
  first(): BreadcrumbBarTarget | undefined;
  focus(): void;
  last(): BreadcrumbBarTarget | undefined;
  next(): BreadcrumbBarTarget | undefined;
  previous(): BreadcrumbBarTarget | undefined;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function targets<TAction extends BreadcrumbBarAction>(
  data: BreadcrumbBarData<TAction>,
): Array<{ disabled: boolean; id: BreadcrumbBarTarget }> {
  return [
    ...(data.previousSibling === undefined
      ? []
      : [{ disabled: data.previousSibling.disabled === true, id: 'previous' as const }]),
    ...(data.nextSibling === undefined
      ? []
      : [{ disabled: data.nextSibling.disabled === true, id: 'next' as const }]),
    ...(data.actions ?? []).map(({ disabled, id }) => ({
      disabled: disabled === true,
      id: `action:${id}` as const,
    })),
  ];
}

function target(value: string | undefined): BreadcrumbBarTarget | undefined {
  return value as BreadcrumbBarTarget | undefined;
}

/** Creates an interactive breadcrumb, sibling-navigation, and action bar. */
export function breadcrumbBar<TAction extends BreadcrumbBarAction>({
  box,
  data: initialData,
  parent,
}: BreadcrumbBarOptions<TAction>): BreadcrumbBarHandle<TAction> {
  let data = initialData;
  let scope = createFocusScope({ items: targets(data) });
  let active = data.activeTarget;

  const element = blessed.box({
    height: 1,
    keys: true,
    left: 0,
    mouse: true,
    right: 0,
    ...box,
    content: '',
    parent,
    style: { ...box?.style, border: { ...box?.style?.border } },
    tags: false,
  });
  const style = createBoxStyleController(element, box, {}, { component: 'breadcrumb-bar' });
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderBreadcrumbBar({
        ...data,
        ...(active === undefined ? {} : { activeTarget: active }),
        characters: capabilities.unicode
          ? BREADCRUMB_BAR_UNICODE_CHARACTERS
          : BREADCRUMB_BAR_ASCII_CHARACTERS,
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
  const setActive = (target: BreadcrumbBarTarget | undefined) => {
    if (target !== undefined && target !== active) {
      active = target;
      data.onActiveTargetChange?.(target);
      render();
    }

    return active;
  };

  scope.activate();
  active = target(scope.focus(active ?? '') ?? scope.current());
  render();

  const available = (reverse = false) =>
    (reverse ? [...targets(data)].reverse() : targets(data)).find(({ disabled }) => !disabled)?.id;
  const handle: BreadcrumbBarHandle<TAction> = {
    activateActive() {
      const { previousSibling } = data;
      const { nextSibling } = data;

      if (active === 'previous' && previousSibling !== undefined && !previousSibling.disabled) {
        data.onNavigateSibling?.(previousSibling, 'previous');

        return previousSibling;
      }

      if (active === 'next' && nextSibling !== undefined && !nextSibling.disabled) {
        data.onNavigateSibling?.(nextSibling, 'next');

        return nextSibling;
      }

      if (active?.startsWith('action:')) {
        const id = active.slice(7);
        const action = data.actions?.find(
          (candidate) => candidate.id === id && !candidate.disabled,
        );

        if (action !== undefined) {
          data.onAction?.(action);
        }

        return action;
      }

      return undefined;
    },
    activeTarget: () => active,
    destroy: () => element.destroy(),
    element,
    first: () => setActive(available()),
    focus: () => element.focus(),
    last: () => setActive(available(true)),
    next: () => setActive(target(scope.next())),
    previous: () => setActive(target(scope.previous())),
    setData(nextData) {
      const previous = active;

      data = nextData;
      scope = createFocusScope({
        ...(data.activeTarget === undefined ? {} : { initialFocusId: data.activeTarget }),
        items: targets(data),
      });
      scope.activate();
      active = target(
        data.activeTarget ??
          (previous === undefined ? scope.current() : (scope.focus(previous) ?? scope.current())),
      );
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
