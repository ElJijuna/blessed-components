import blessed from 'blessed';

import {
  type MultiSelectCharacters,
  type MultiSelectItem,
  renderMultiSelect,
} from '@/components/input/multi-select/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the MultiSelect adapter. */
export type MultiSelectBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link multiSelect} adapter. */
export interface MultiSelectData<TItem extends MultiSelectItem = MultiSelectItem> {
  /** Preferred initial cursor identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: MultiSelectCharacters;

  /** Initial selection for uncontrolled usage. Ignored when `values` is supplied. */
  defaultValues?: readonly string[];

  /** Text displayed when no options exist. */
  emptyText?: string;

  /** Ordered options. Disabled options are visible but not interactive. */
  items: readonly TItem[];

  /** Called after the cursor moves to a different enabled option. */
  onActiveIdChange?: (activeId: string) => void;

  /** Called after the open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** Called when selection changes or a controlled selection is requested. */
  onValuesChange?: (values: readonly string[]) => void;

  /** Controlled open state. */
  open?: boolean;

  /** Text shown when no values are selected. */
  placeholder?: string;

  /** Controlled selected option identifiers. */
  values?: readonly string[];
}

/** Options accepted by the Blessed {@link multiSelect} adapter. */
export interface MultiSelectOptions<TItem extends MultiSelectItem = MultiSelectItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: MultiSelectBoxOptions;

  /** Options, controlled values/open state, and listeners. */
  data: MultiSelectData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link multiSelect}. */
export interface MultiSelectHandle<TItem extends MultiSelectItem = MultiSelectItem>
  extends BlessedComponentHandle<MultiSelectData<TItem>, blessed.Widgets.BoxElement> {
  /** Returns the current enabled cursor identifier. */
  activeId(): string | undefined;

  /** Clears selected values. */
  clear(): boolean;

  /** Closes the option list. */
  close(): boolean;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves the cursor to an enabled identifier. */
  focusItem(id: string): string | undefined;

  /** Moves the cursor to the next enabled option, wrapping at the end. */
  next(): string | undefined;

  /** Opens the option list. */
  open(): boolean;

  /** Returns the current open state. */
  opened(): boolean;

  /** Moves the cursor to the previous enabled option, wrapping at the start. */
  previous(): string | undefined;

  /** Toggles the option list. */
  toggle(): boolean;

  /** Toggles the focused option. */
  toggleActive(): readonly string[] | undefined;

  /** Returns the current controlled or uncontrolled selected identifiers. */
  values(): readonly string[];
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive multiple-selection control backed by a Blessed box. */
export function multiSelect<TItem extends MultiSelectItem>({
  box,
  data: initialData,
  parent,
}: MultiSelectOptions<TItem>): MultiSelectHandle<TItem> {
  let data = initialData;
  let uncontrolledValues = [...(initialData.defaultValues ?? [])];
  let uncontrolledOpen = initialData.open ?? false;
  let currentActiveId =
    initialData.activeId ?? initialData.values?.[0] ?? initialData.defaultValues?.[0];
  let offset = 0;

  const element = blessed.box({
    keys: true,
    mouse: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const isValuesControlled = (): boolean => Object.hasOwn(data, 'values');
  const isOpenControlled = (): boolean => Object.hasOwn(data, 'open');
  const selectedValues = (): readonly string[] =>
    isValuesControlled() ? (data.values ?? []) : uncontrolledValues;
  const opened = (): boolean => (isOpenControlled() ? data.open === true : uncontrolledOpen);
  const optionViewportHeight = (): number => Math.max(0, viewportSize().height - 1);

  let focusScope = createFocusScope({ items: data.items });
  let selection = createSelectionModel({
    defaultSelectedIds: selectedValues(),
    items: data.items,
    mode: 'multiple',
  });
  let scrollArea = createScrollArea({
    contentSize: data.items.length,
    viewportSize: optionViewportHeight(),
  });

  const render = (): void => {
    const dimensions = viewportSize();

    scrollArea.setSizes({ contentSize: data.items.length, viewportSize: optionViewportHeight() });
    offset = scrollArea.scrollTo(offset);
    element.setContent(
      renderMultiSelect({
        ...(currentActiveId === undefined ? {} : { activeId: currentActiveId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: dimensions.height,
        items: data.items,
        open: opened(),
        offset,
        ...(data.placeholder === undefined ? {} : { placeholder: data.placeholder }),
        values: selectedValues(),
        width: dimensions.width,
      }),
    );
  };
  const ensureActiveVisible = (): void => {
    const index = data.items.findIndex(({ id }) => id === currentActiveId);
    const height = optionViewportHeight();

    if (index < 0 || height === 0) {
      return;
    }

    if (index < offset) {
      offset = scrollArea.scrollTo(index);
    } else if (index >= offset + height) {
      offset = scrollArea.scrollTo(index - height + 1);
    }
  };
  const setOpen = (nextOpen: boolean): boolean => {
    if (opened() === nextOpen) {
      return false;
    }

    if (!isOpenControlled()) {
      uncontrolledOpen = nextOpen;
    }

    data.onOpenChange?.(nextOpen);
    render();

    return true;
  };
  const setActive = (id: string | undefined): string | undefined => {
    if (id === undefined || id === currentActiveId) {
      return currentActiveId;
    }

    currentActiveId = id;
    ensureActiveVisible();
    data.onActiveIdChange?.(id);
    render();

    return currentActiveId;
  };
  const rebuildModels = (): void => {
    const previousActiveId = currentActiveId;

    focusScope = createFocusScope({
      ...(data.activeId === undefined ? {} : { initialFocusId: data.activeId }),
      items: data.items,
    });
    currentActiveId = focusScope.activate();

    if (
      data.activeId === undefined &&
      previousActiveId !== undefined &&
      data.items.some(({ disabled, id }) => id === previousActiveId && disabled !== true)
    ) {
      currentActiveId = focusScope.focus(previousActiveId);
    }

    selection = createSelectionModel({
      defaultSelectedIds: selectedValues(),
      items: data.items,
      mode: 'multiple',
    });
    scrollArea = createScrollArea({
      contentSize: data.items.length,
      viewportSize: optionViewportHeight(),
    });
    ensureActiveVisible();
  };
  const emitValues = (nextValues: readonly string[]): readonly string[] => {
    if (!isValuesControlled()) {
      uncontrolledValues = [...nextValues];
    }

    data.onValuesChange?.(nextValues);
    render();

    return nextValues;
  };

  currentActiveId = focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  render();

  const handle: MultiSelectHandle<TItem> = {
    activeId: () => currentActiveId,
    clear() {
      if (!isValuesControlled()) {
        if (!selection.clear()) {
          return false;
        }

        emitValues(selection.selectedIds());

        return true;
      }

      data.onValuesChange?.([]);
      render();

      return true;
    },
    close: () => setOpen(false),
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      element.focus();
    },
    focusItem: (id) => setActive(focusScope.focus(id)),
    next() {
      setOpen(true);

      return setActive(focusScope.next());
    },
    open: () => setOpen(true),
    opened,
    previous() {
      setOpen(true);

      return setActive(focusScope.previous());
    },
    setData(nextData) {
      data = nextData;

      if (isValuesControlled()) {
        uncontrolledValues = [];
      }

      if (isOpenControlled()) {
        uncontrolledOpen = false;
      }

      rebuildModels();
      render();
    },
    toggle() {
      return setOpen(!opened());
    },
    toggleActive() {
      if (currentActiveId === undefined) {
        return undefined;
      }

      if (isValuesControlled()) {
        const selected = new Set(selectedValues());

        if (selected.has(currentActiveId)) {
          selected.delete(currentActiveId);
        } else if (
          data.items.some(({ disabled, id }) => id === currentActiveId && disabled !== true)
        ) {
          selected.add(currentActiveId);
        }

        const ordered = data.items.filter(({ id }) => selected.has(id)).map(({ id }) => id);

        data.onValuesChange?.(ordered);
        render();

        return ordered;
      }

      if (selection.toggle(currentActiveId)) {
        return emitValues(selection.selectedIds());
      }

      return selectedValues();
    },
    values: selectedValues,
  };

  element.on('click', () => {
    handle.toggle();
  });
  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'down':
        handle.next();
        break;
      case 'escape':
        handle.close();
        break;
      case 'enter':
      case 'space':
        if (opened()) {
          handle.toggleActive();
        } else {
          handle.open();
        }

        break;
      case 'up':
        handle.previous();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
