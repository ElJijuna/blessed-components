import blessed from 'blessed';

import {
  renderSelect,
  type SelectCharacters,
  type SelectItem,
} from '@/components/input/select/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Select adapter. */
export type SelectBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link select} adapter. */
export interface SelectData<TItem extends SelectItem = SelectItem> {
  /** Preferred initial cursor identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: SelectCharacters;

  /** Initial selection for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no options exist. */
  emptyText?: string;

  /** Ordered options. Disabled options are visible but not interactive. */
  items: readonly TItem[];

  /** Called after the open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** Called after the cursor moves to a different enabled option. */
  onActiveIdChange?: (activeId: string) => void;

  /** Called when selection changes or a controlled selection is requested. */
  onValueChange?: (value: string) => void;

  /** Controlled open state. */
  open?: boolean;

  /** Text shown when no value is selected. */
  placeholder?: string;

  /** Controlled selected option identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link select} adapter. */
export interface SelectOptions<TItem extends SelectItem = SelectItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: SelectBoxOptions;

  /** Options, controlled value/open state, and listeners. */
  data: SelectData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link select}. */
export interface SelectHandle<TItem extends SelectItem = SelectItem>
  extends BlessedComponentHandle<SelectData<TItem>, blessed.Widgets.BoxElement> {
  /** Returns the current enabled cursor identifier. */
  activeId(): string | undefined;

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

  /** Selects the focused option and closes the list. */
  selectActive(): string | undefined;

  /** Toggles the option list. */
  toggle(): boolean;

  /** Returns the current controlled or uncontrolled selected identifier. */
  value(): string | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive single-selection Select backed by a Blessed box. */
export function select<TItem extends SelectItem>({
  box,
  data: initialData,
  parent,
}: SelectOptions<TItem>): SelectHandle<TItem> {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue;
  let uncontrolledOpen = initialData.open ?? false;
  let currentActiveId = initialData.activeId ?? initialData.value ?? initialData.defaultValue;
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
  const isValueControlled = (): boolean => Object.hasOwn(data, 'value');
  const isOpenControlled = (): boolean => Object.hasOwn(data, 'open');
  const selectedValue = (): string | undefined =>
    isValueControlled() ? data.value : uncontrolledValue;
  const opened = (): boolean => (isOpenControlled() ? data.open === true : uncontrolledOpen);
  const optionViewportHeight = (): number => Math.max(0, viewportSize().height - 1);

  let focusScope = createFocusScope({ items: data.items });
  let selection = createSelectionModel({
    allowEmpty: false,
    defaultSelectedIds: selectedValue() === undefined ? [] : [selectedValue() ?? ''],
    items: data.items,
  });
  let scrollArea = createScrollArea({
    contentSize: data.items.length,
    viewportSize: optionViewportHeight(),
  });

  const render = (): void => {
    const dimensions = viewportSize();
    const value = selectedValue();

    scrollArea.setSizes({ contentSize: data.items.length, viewportSize: optionViewportHeight() });
    offset = scrollArea.scrollTo(offset);
    element.setContent(
      renderSelect({
        ...(currentActiveId === undefined ? {} : { activeId: currentActiveId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: dimensions.height,
        items: data.items,
        open: opened(),
        offset,
        ...(data.placeholder === undefined ? {} : { placeholder: data.placeholder }),
        ...(value === undefined ? {} : { value }),
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
    const value = selectedValue();

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
    } else if (
      data.activeId === undefined &&
      value !== undefined &&
      data.items.some(({ disabled, id }) => id === value && disabled !== true)
    ) {
      currentActiveId = focusScope.focus(value);
    }

    selection = createSelectionModel({
      allowEmpty: false,
      defaultSelectedIds: value === undefined ? [] : [value],
      items: data.items,
    });
    scrollArea = createScrollArea({
      contentSize: data.items.length,
      viewportSize: optionViewportHeight(),
    });
    ensureActiveVisible();
  };

  currentActiveId = focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  render();

  const handle: SelectHandle<TItem> = {
    activeId: () => currentActiveId,
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
    selectActive() {
      if (currentActiveId === undefined) {
        return undefined;
      }

      if (isValueControlled()) {
        data.onValueChange?.(currentActiveId);
        setOpen(false);

        return currentActiveId;
      }

      if (selection.select(currentActiveId)) {
        uncontrolledValue = currentActiveId;
        data.onValueChange?.(currentActiveId);
      }

      setOpen(false);
      render();

      return currentActiveId;
    },
    setData(nextData) {
      data = nextData;

      if (isValueControlled()) {
        uncontrolledValue = undefined;
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
    value: selectedValue,
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
          handle.selectActive();
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
