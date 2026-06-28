import blessed from 'blessed';

import {
  type RadioGroupCharacters,
  type RadioGroupItem,
  renderRadioGroup,
} from '@/components/input/radio-group/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the RadioGroup adapter. */
export type RadioGroupBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link radioGroup} adapter. */
export interface RadioGroupData<TItem extends RadioGroupItem = RadioGroupItem> {
  /** Preferred initial cursor identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: RadioGroupCharacters;

  /** Initial selection for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no options exist. */
  emptyText?: string;

  /** Ordered options. Disabled options are visible but not interactive. */
  items: readonly TItem[];

  /** Called after the cursor moves to a different enabled option. */
  onActiveIdChange?: (activeId: string) => void;

  /** Called when selection changes or a controlled selection is requested. */
  onValueChange?: (value: string) => void;

  /** Controlled selected option identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link radioGroup} adapter. */
export interface RadioGroupOptions<TItem extends RadioGroupItem = RadioGroupItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: RadioGroupBoxOptions;

  /** Options, controlled or uncontrolled value, and listeners. */
  data: RadioGroupData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link radioGroup}. */
export interface RadioGroupHandle<TItem extends RadioGroupItem = RadioGroupItem>
  extends BlessedComponentHandle<RadioGroupData<TItem>, blessed.Widgets.BoxElement> {
  /** Returns the current enabled cursor identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves the cursor to an enabled identifier. */
  focusItem(id: string): string | undefined;

  /** Moves the cursor to the next enabled option, wrapping at the end. */
  next(): string | undefined;

  /** Moves the cursor to the previous enabled option, wrapping at the start. */
  previous(): string | undefined;

  /** Selects the focused option. */
  selectActive(): string | undefined;

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

/** Creates an interactive single-selection RadioGroup backed by a Blessed box. */
export function radioGroup<TItem extends RadioGroupItem>({
  box,
  data: initialData,
  parent,
}: RadioGroupOptions<TItem>): RadioGroupHandle<TItem> {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue;
  let currentActiveId = initialData.activeId;
  let offset = 0;

  const element = blessed.box({
    keys: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const selectedValue = (): string | undefined => (isControlled() ? data.value : uncontrolledValue);

  let focusScope = createFocusScope({ items: data.items });
  let selection = createSelectionModel({
    allowEmpty: false,
    defaultSelectedIds: selectedValue() === undefined ? [] : [selectedValue() ?? ''],
    items: data.items,
  });
  let scrollArea = createScrollArea({
    contentSize: data.items.length,
    viewportSize: viewportSize().height,
  });

  const render = (): void => {
    const dimensions = viewportSize();
    const value = selectedValue();

    scrollArea.setSizes({ contentSize: data.items.length, viewportSize: dimensions.height });
    offset = scrollArea.scrollTo(offset);
    element.setContent(
      renderRadioGroup({
        ...(currentActiveId === undefined ? {} : { activeId: currentActiveId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: dimensions.height,
        items: data.items,
        offset,
        ...(value === undefined ? {} : { value }),
        width: dimensions.width,
      }),
    );
  };
  const ensureActiveVisible = (): void => {
    const index = data.items.findIndex(({ id }) => id === currentActiveId);
    const { height } = viewportSize();

    if (index < 0 || height === 0) {
      return;
    }

    if (index < offset) {
      offset = scrollArea.scrollTo(index);
    } else if (index >= offset + height) {
      offset = scrollArea.scrollTo(index - height + 1);
    }
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
      allowEmpty: false,
      defaultSelectedIds: selectedValue() === undefined ? [] : [selectedValue() ?? ''],
      items: data.items,
    });
    scrollArea = createScrollArea({
      contentSize: data.items.length,
      viewportSize: viewportSize().height,
    });
    ensureActiveVisible();
  };

  currentActiveId = focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  render();

  const handle: RadioGroupHandle<TItem> = {
    activeId: () => currentActiveId,
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      element.focus();
    },
    focusItem: (id) => setActive(focusScope.focus(id)),
    next: () => setActive(focusScope.next()),
    previous: () => setActive(focusScope.previous()),
    selectActive() {
      if (currentActiveId === undefined) {
        return undefined;
      }

      if (isControlled()) {
        data.onValueChange?.(currentActiveId);

        return currentActiveId;
      }

      if (selection.select(currentActiveId)) {
        uncontrolledValue = currentActiveId;
        data.onValueChange?.(currentActiveId);
        render();
      }

      return currentActiveId;
    },
    setData(nextData) {
      data = nextData;

      if (isControlled()) {
        uncontrolledValue = undefined;
      }

      rebuildModels();
      render();
    },
    value: selectedValue,
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'down':
        handle.next();
        break;
      case 'enter':
      case 'space':
        handle.selectActive();
        break;
      case 'up':
        handle.previous();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
