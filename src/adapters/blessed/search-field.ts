import blessed from 'blessed';

import {
  renderSearchField,
  type SearchFieldCharacters,
} from '@/components/input/search-field/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed textbox options supported by the SearchField adapter. */
export type SearchFieldBoxOptions = Omit<
  blessed.Widgets.TextboxOptions,
  'content' | 'keys' | 'mouse' | 'multiline' | 'parent' | 'tags' | 'value'
>;

/** Stateful data accepted by the Blessed {@link searchField} adapter. */
export interface SearchFieldData {
  /** Character tokens used by the pure renderer. */
  characters?: SearchFieldCharacters;

  /** Initial query for uncontrolled usage. */
  defaultQuery?: string;

  /** Whether focus and editing are unavailable. */
  disabled?: boolean;

  /** Error text. When present it takes precedence over `hint`. */
  error?: string;

  /** Hint text shown when no error is present. */
  hint?: string;

  /** Field label. */
  label: string;

  /** Called after a clear request is accepted. */
  onClear?: () => void;

  /** Called after user or imperative edits request a query change. */
  onQueryChange?: (query: string) => void;

  /** Called when the user or imperative API requests a submitted query. */
  onSubmit?: (query: string) => void;

  /** Placeholder shown when query is empty. */
  placeholder?: string;

  /** Controlled query text. */
  query?: string;

  /** Whether the label should include a required indicator. */
  required?: boolean;
}

/** Options accepted by the Blessed {@link searchField} adapter. */
export interface SearchFieldOptions {
  /** Position, dimensions, style, and standard Blessed textbox settings. */
  box?: SearchFieldBoxOptions;

  /** Label, query, placeholder, hint, error, and callbacks. */
  data: SearchFieldData;

  /** Blessed screen or node receiving the created textbox. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link searchField}. */
export interface SearchFieldHandle
  extends BlessedComponentHandle<SearchFieldData, blessed.Widgets.TextboxElement> {
  /** Clears an enabled search field and reports whether clearing occurred. */
  clear(): boolean;

  /** Gives terminal focus to an enabled search field. */
  focus(): void;

  /** Returns the current controlled or uncontrolled query. */
  query(): string;

  /** Sets an enabled query and reports whether editing occurred. */
  setQuery(query: string): boolean;

  /** Submits the current query and reports whether submission occurred. */
  submit(): boolean;
}

interface Keypress {
  full?: string;
  name?: string;
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

/** Creates a single-line SearchField backed by a Blessed textbox. */
export function searchField({
  box,
  data: initialData,
  parent,
}: SearchFieldOptions): SearchFieldHandle {
  let data = initialData;
  let focused = false;
  let uncontrolledQuery = initialData.defaultQuery ?? '';

  const element = blessed.textbox({
    ...box,
    inputOnFocus: true,
    keys: true,
    mouse: true,
    multiline: false,
    parent,
    tags: false,
    value: initialData.query ?? uncontrolledQuery,
  });
  const isControlled = (): boolean => Object.hasOwn(data, 'query');
  const currentQuery = (): string => (isControlled() ? (data.query ?? '') : uncontrolledQuery);
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const render = (): void => {
    const dimensions = viewportSize();

    element.setContent(
      renderSearchField({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        disabled: data.disabled === true,
        ...(data.error === undefined ? {} : { error: data.error }),
        focused,
        height: dimensions.height,
        ...(data.hint === undefined ? {} : { hint: data.hint }),
        label: data.label,
        ...(data.placeholder === undefined ? {} : { placeholder: data.placeholder }),
        query: currentQuery(),
        ...(data.required === undefined ? {} : { required: data.required }),
        width: dimensions.width,
      }),
    );
  };
  const syncBlessedValue = (): void => {
    const query = currentQuery();

    if (element.getValue() !== query) {
      element.setValue(query);
    }
  };
  const syncInteraction = (): void => {
    if (data.disabled === true) {
      removeFrom(element.screen.clickable, element);
      removeFrom(element.screen.keyable, element);

      return;
    }

    element.enableInput();
  };
  const commitQuery = (nextQuery: string): boolean => {
    if (data.disabled === true) {
      return false;
    }

    if (!isControlled()) {
      uncontrolledQuery = nextQuery;
    }

    data.onQueryChange?.(nextQuery);
    syncBlessedValue();
    render();

    return true;
  };
  const handle: SearchFieldHandle = {
    clear() {
      const didClear = commitQuery('');

      if (didClear) {
        data.onClear?.();
      }

      return didClear;
    },
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      if (data.disabled !== true) {
        element.focus();
      }
    },
    query: currentQuery,
    setData(nextData) {
      data = nextData;

      if (!isControlled() && nextData.defaultQuery !== undefined) {
        uncontrolledQuery = nextData.defaultQuery;
      }

      syncInteraction();
      syncBlessedValue();
      render();
    },
    setQuery(query) {
      return commitQuery(query);
    },
    submit() {
      if (data.disabled === true) {
        return false;
      }

      data.onSubmit?.(currentQuery());

      return true;
    },
  };

  element.on('blur', () => {
    focused = false;
    syncBlessedValue();
    render();
  });
  element.on('focus', () => {
    focused = true;
    syncBlessedValue();
    render();
  });
  element.on('keypress', (_character: string, key: Keypress) => {
    if ((key.full ?? key.name) === 'escape') {
      handle.clear();
    }
  });
  element.on('submit', (query: string) => {
    commitQuery(query);
    data.onSubmit?.(currentQuery());
  });
  element.on('cancel', () => {
    syncBlessedValue();
    render();
  });
  element.on('resize', render);

  syncInteraction();
  syncBlessedValue();
  render();

  return handle;
}
