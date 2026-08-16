import blessed from 'blessed';

import {
  type CreateSearchBarStateOptions,
  createSearchBarState,
  renderSearchBar,
  SEARCH_BAR_ASCII_CHARACTERS,
  SEARCH_BAR_UNICODE_CHARACTERS,
  type SearchBarCharacters,
  type SearchBarStateModel,
  type SearchBarTarget,
} from '@/components/input/search-bar/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed textbox options supported by SearchBar. */
export type SearchBarBoxOptions = Omit<
  blessed.Widgets.TextboxOptions,
  'content' | 'keys' | 'mouse' | 'multiline' | 'parent' | 'tags' | 'value'
>;

/** Stateful data accepted by the Blessed {@link searchBar} adapter. */
export interface SearchBarData extends CreateSearchBarStateOptions, BoxData {
  /** Terminal capabilities used for characters and theme colors. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;
  /** Character tokens used by the pure renderer. */
  characters?: SearchBarCharacters;
  /** Called when keyboard focus moves between virtual controls. */
  onActiveTargetChange?: (target: SearchBarTarget) => void;
  /** Placeholder shown for an empty query. */
  placeholder?: string;
  /** Optional result metadata. */
  resultCount?: number;
  /** Whether a submit control is shown. @defaultValue `true` */
  showSubmit?: boolean;
  /** Explicit render width, overriding the element's inner width. */
  width?: number;
}

/** Options accepted by the Blessed {@link searchBar} adapter. */
export interface SearchBarOptions {
  /** Position, dimensions, style, and standard Blessed textbox settings. */
  box?: SearchBarBoxOptions;
  /** Query, scopes, result metadata, callbacks, and theme data. */
  data: SearchBarData;
  /** Blessed screen or node receiving the SearchBar. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link searchBar}. */
export interface SearchBarHandle
  extends BlessedComponentHandle<SearchBarData, blessed.Widgets.TextboxElement>,
    Pick<
      SearchBarStateModel,
      | 'activeScope'
      | 'clear'
      | 'nextScope'
      | 'previousScope'
      | 'query'
      | 'setQuery'
      | 'setScope'
      | 'submit'
    > {
  /** Activates the selected virtual control. */
  activateActive(): SearchBarTarget;
  /** Current virtual control. */
  activeTarget(): SearchBarTarget;
  /** Focuses the SearchBar when enabled. */
  focus(): void;
  /** Selects an available virtual control. */
  focusTarget(target: SearchBarTarget): SearchBarTarget;
  /** Moves to the next virtual control. */
  next(): SearchBarTarget;
  /** Moves to the previous virtual control. */
  previous(): SearchBarTarget;
}

interface Keypress {
  ctrl?: boolean;
  full?: string;
  meta?: boolean;
  name?: string;
  shift?: boolean;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function removeFrom(
  elements: blessed.Widgets.BlessedElement[],
  element: blessed.Widgets.BoxElement,
): void {
  const index = elements.indexOf(element);

  if (index >= 0) {
    elements.splice(index, 1);
  }
}

function isPrintableText(value: string): boolean {
  return Array.from(value).every((character) => {
    const codePoint = character.codePointAt(0) ?? 0;

    return codePoint >= 0x20 && codePoint !== 0x7f;
  });
}

/** Creates a scoped, single-line search controller backed by a Blessed textbox. */
export function searchBar({ box, data: initialData, parent }: SearchBarOptions): SearchBarHandle {
  let data = initialData;
  let active: SearchBarTarget = 'query';
  let cursorIndex = Array.from(initialData.query ?? initialData.defaultQuery ?? '').length;

  const element = blessed.textbox({
    height: 1,
    ...box,
    inputOnFocus: false,
    keys: true,
    mouse: true,
    multiline: false,
    parent,
    tags: false,
    value: initialData.query ?? initialData.defaultQuery ?? '',
  });
  const style = createBoxStyleController(element, box, {}, { component: 'search-bar' });
  const stateOptions = (): CreateSearchBarStateOptions => ({
    ...(data.defaultQuery === undefined ? {} : { defaultQuery: data.defaultQuery }),
    ...(data.defaultScopeId === undefined ? {} : { defaultScopeId: data.defaultScopeId }),
    ...(data.disabled === undefined ? {} : { disabled: data.disabled }),
    ...(data.onClear === undefined ? {} : { onClear: data.onClear }),
    ...(data.onQueryChange === undefined ? {} : { onQueryChange: data.onQueryChange }),
    ...(data.onScopeChange === undefined ? {} : { onScopeChange: data.onScopeChange }),
    ...(data.onSubmit === undefined ? {} : { onSubmit: data.onSubmit }),
    ...(data.query === undefined ? {} : { query: data.query }),
    ...(data.scopeId === undefined ? {} : { scopeId: data.scopeId }),
    ...(data.scopes === undefined ? {} : { scopes: data.scopes }),
  });
  const state = createSearchBarState(stateOptions());
  const targets = (): SearchBarTarget[] => {
    const available: SearchBarTarget[] = [];

    if ((data.scopes?.length ?? 0) > 1) {
      available.push('scope');
    }

    available.push('query');

    if (state.query().length > 0) {
      available.push('clear');
    }

    if (data.showSubmit !== false) {
      available.push('submit');
    }

    return available;
  };
  const reconcileActive = (): void => {
    if (!targets().includes(active)) {
      active = 'query';
    }
  };
  const width = (): number =>
    data.width ?? Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const syncBlessedValue = (): void => {
    const query = state.query();

    if (element.getValue() !== query) {
      element.setValue(query);
    }

    cursorIndex = Math.min(cursorIndex, Array.from(query).length);
  };
  const render = (): void => {
    const capabilities = data.capabilities ?? detectCapabilities();
    const scope = state.activeScope();

    reconcileActive();
    style.apply({
      backgroundTone: data.backgroundTone,
      borderTone: data.borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: data.foregroundTone,
      theme: data.theme,
    });
    element.setContent(
      renderSearchBar({
        activeTarget: active,
        characters:
          data.characters ??
          (capabilities.unicode ? SEARCH_BAR_UNICODE_CHARACTERS : SEARCH_BAR_ASCII_CHARACTERS),
        disabled: data.disabled === true,
        ...(data.placeholder === undefined ? {} : { placeholder: data.placeholder }),
        query: state.query(),
        ...(data.resultCount === undefined ? {} : { resultCount: data.resultCount }),
        ...(scope === undefined ? {} : { scopeId: scope.id }),
        scopes: data.scopes ?? [],
        showSubmit: data.showSubmit !== false,
        width: width(),
      }),
    );
  };
  const syncInteraction = (): void => {
    if (data.disabled === true) {
      removeFrom(element.screen.clickable, element);
      removeFrom(element.screen.keyable, element);

      return;
    }

    element.enableInput();
  };
  const setActive = (target: SearchBarTarget): SearchBarTarget => {
    if (targets().includes(target) && target !== active) {
      active = target;
      data.onActiveTargetChange?.(target);
      render();
    }

    return active;
  };
  const move = (step: number): SearchBarTarget => {
    const available = targets();
    const index = available.indexOf(active);

    return setActive(available[(index + step + available.length) % available.length] ?? 'query');
  };
  const perform = (action: () => boolean): boolean => {
    const result = action();

    syncBlessedValue();
    render();

    return result;
  };
  const editQuery = (nextQuery: string, nextCursorIndex: number): boolean => {
    const changed = perform(() => state.setQuery(nextQuery));

    if (changed) {
      cursorIndex = Math.min(nextCursorIndex, Array.from(state.query()).length);
    }

    return changed;
  };
  const insert = (value: string): void => {
    const query = Array.from(state.query());
    const inserted = Array.from(value);

    query.splice(cursorIndex, 0, ...inserted);
    editQuery(query.join(''), cursorIndex + inserted.length);
  };
  const handle: SearchBarHandle = {
    activateActive() {
      switch (active) {
        case 'clear':
          handle.clear();
          break;
        case 'scope':
          handle.nextScope();
          break;
        case 'query':
        case 'submit':
          handle.submit();
          break;
      }

      return active;
    },
    activeScope: state.activeScope,
    activeTarget: () => active,
    clear: () => perform(() => state.clear()),
    destroy: () => element.destroy(),
    element,
    focus() {
      if (data.disabled !== true) {
        active = 'query';
        cursorIndex = Array.from(state.query()).length;
        element.focus();
        render();
      }
    },
    focusTarget: setActive,
    next: () => move(1),
    nextScope() {
      const scope = state.nextScope();

      render();

      return scope;
    },
    previous: () => move(-1),
    previousScope() {
      const scope = state.previousScope();

      render();

      return scope;
    },
    query: state.query,
    setData(nextData) {
      data = nextData;
      state.setOptions(stateOptions());
      reconcileActive();
      syncInteraction();
      syncBlessedValue();
      render();
    },
    setQuery: (query) => perform(() => state.setQuery(query)),
    setScope(scopeId) {
      const changed = state.setScope(scopeId);

      render();

      return changed;
    },
    submit: () => perform(() => state.submit()),
  };

  element.on('focus', () => {
    active = 'query';
    cursorIndex = Array.from(state.query()).length;
    syncBlessedValue();
    render();
  });
  element.on('keypress', (character: string | undefined, key: Keypress) => {
    if (data.disabled === true) {
      return;
    }

    const keyName = key.full ?? (key.shift && key.name === 'tab' ? 'shift-tab' : key.name);

    switch (keyName) {
      case 'backspace':
        if (active === 'query' && cursorIndex > 0) {
          const query = Array.from(state.query());

          query.splice(cursorIndex - 1, 1);
          editQuery(query.join(''), cursorIndex - 1);
        }

        break;
      case 'delete':
        if (active === 'query') {
          const query = Array.from(state.query());

          if (cursorIndex < query.length) {
            query.splice(cursorIndex, 1);
            editQuery(query.join(''), cursorIndex);
          }
        }

        break;
      case 'end':
        if (active === 'query') {
          cursorIndex = Array.from(state.query()).length;
        }

        break;
      case 'enter':
      case 'return':
        handle.activateActive();
        break;
      case 'escape':
        handle.clear();
        cursorIndex = 0;
        break;
      case 'home':
        if (active === 'query') {
          cursorIndex = 0;
        }

        break;
      case 'tab':
        handle.next();
        break;
      case 'shift-tab':
        handle.previous();
        break;
      case 'left':
        if (active === 'query') {
          cursorIndex = Math.max(0, cursorIndex - 1);
        } else {
          handle.previous();
        }

        break;
      case 'right':
        if (active === 'query') {
          cursorIndex = Math.min(Array.from(state.query()).length, cursorIndex + 1);
        } else {
          handle.next();
        }

        break;
      case 'up':
        if (active === 'scope') {
          handle.previousScope();
        }

        break;
      case 'down':
        if (active === 'scope') {
          handle.nextScope();
        }

        break;

      default:
        if (
          active === 'query' &&
          character !== undefined &&
          character.length > 0 &&
          key.ctrl !== true &&
          key.meta !== true &&
          isPrintableText(character)
        ) {
          insert(character);
        }
    }
  });
  element.on('submit', (query: string) => {
    state.setQuery(query);
    cursorIndex = Array.from(state.query()).length;

    handle.activateActive();
  });
  element.on('cancel', () => {
    syncBlessedValue();
    render();
  });
  element.on('click', () => setActive('query'));
  element.on('resize', render);

  syncInteraction();
  syncBlessedValue();
  render();

  return handle;
}
