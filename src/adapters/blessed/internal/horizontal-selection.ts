import blessed from 'blessed';

import type { CollectionItem } from '@/primitives/collection/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';

type HorizontalSelectionBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;

export interface HorizontalSelectionData<TItem extends CollectionItem> {
  activeId?: string;
  defaultValue?: string;
  items: readonly TItem[];
  onActiveIdChange?: (activeId: string) => void;
  value?: string;
}

interface HorizontalSelectionRenderContext<
  TItem extends CollectionItem,
  TData extends HorizontalSelectionData<TItem>,
> {
  activeId: string | undefined;
  data: TData;
  value: string | undefined;
  width: number;
}

interface CreateHorizontalSelectionOptions<
  TItem extends CollectionItem,
  TData extends HorizontalSelectionData<TItem>,
> {
  box?: HorizontalSelectionBoxOptions;
  data: TData;
  onActivate(data: TData, value: string): void;
  parent: blessed.Widgets.Node;
  render(context: HorizontalSelectionRenderContext<TItem, TData>): string;
}

export interface HorizontalSelectionController<TData> {
  activateFocused(): string | undefined;
  activeId(): string | undefined;
  destroy(): void;
  element: blessed.Widgets.BoxElement;
  first(): string | undefined;
  focus(): void;
  focusItem(id: string): string | undefined;
  last(): string | undefined;
  next(): string | undefined;
  previous(): string | undefined;
  setData(data: TData): void;
  value(): string | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function createHorizontalSelection<
  TItem extends CollectionItem,
  TData extends HorizontalSelectionData<TItem>,
>({
  box,
  data: initialData,
  onActivate,
  parent,
  render: renderContent,
}: CreateHorizontalSelectionOptions<TItem, TData>): HorizontalSelectionController<TData> {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue;
  let currentActiveId = initialData.activeId;

  const element = blessed.box({
    keys: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const width = (): number =>
    Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const selectedValue = (): string | undefined => (isControlled() ? data.value : uncontrolledValue);
  const initialValue = selectedValue();

  let focusScope = createFocusScope({ items: data.items });
  let selection = createSelectionModel({
    defaultSelectedIds: initialValue === undefined ? [] : [initialValue],
    items: data.items,
  });

  const render = (): void => {
    element.setContent(
      renderContent({
        activeId: currentActiveId,
        data,
        value: selectedValue(),
        width: width(),
      }),
    );
  };
  const setActive = (id: string | undefined): string | undefined => {
    if (id === undefined || id === currentActiveId) {
      return currentActiveId;
    }

    currentActiveId = id;
    data.onActiveIdChange?.(id);
    render();

    return currentActiveId;
  };
  const move = (direction: 'next' | 'previous'): string | undefined =>
    setActive(focusScope[direction]());
  const focusNearest = (index: number, direction: 'backward' | 'forward'): string | undefined => {
    const step = direction === 'forward' ? 1 : -1;

    for (
      let candidateIndex = index;
      candidateIndex >= 0 && candidateIndex < data.items.length;
      candidateIndex += step
    ) {
      const candidate = data.items[candidateIndex];

      if (candidate?.disabled !== true) {
        return candidate === undefined
          ? currentActiveId
          : setActive(focusScope.focus(candidate.id));
      }
    }

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

    const currentValue = selectedValue();

    selection = createSelectionModel({
      defaultSelectedIds: currentValue === undefined ? [] : [currentValue],
      items: data.items,
    });
  };

  focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();

  const controller: HorizontalSelectionController<TData> = {
    activateFocused() {
      if (currentActiveId === undefined) {
        return undefined;
      }

      if (isControlled()) {
        onActivate(data, currentActiveId);

        return currentActiveId;
      }

      if (selection.select(currentActiveId)) {
        uncontrolledValue = currentActiveId;
        onActivate(data, currentActiveId);
        render();
      }

      return currentActiveId;
    },
    activeId: () => currentActiveId,
    destroy() {
      element.destroy();
    },
    element,
    first: () => focusNearest(0, 'forward'),
    focus() {
      element.focus();
    },
    focusItem: (id) => setActive(focusScope.focus(id)),
    last: () => focusNearest(data.items.length - 1, 'backward'),
    next: () => move('next'),
    previous: () => move('previous'),
    setData(nextData) {
      data = nextData;

      if (isControlled()) {
        uncontrolledValue = undefined;
      } else if (
        uncontrolledValue !== undefined &&
        !data.items.some(({ disabled, id }) => id === uncontrolledValue && disabled !== true)
      ) {
        uncontrolledValue = data.defaultValue;
      }

      rebuildModels();
      render();
    },
    value: selectedValue,
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'end':
        controller.last();
        break;
      case 'enter':
      case 'space':
        controller.activateFocused();
        break;
      case 'home':
        controller.first();
        break;
      case 'left':
        controller.previous();
        break;
      case 'right':
        controller.next();
        break;
    }
  });
  element.on('resize', render);
  render();

  return controller;
}
