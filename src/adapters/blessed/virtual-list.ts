import blessed from 'blessed';
import type { ListItem } from '@/components/collections/list/index.js';
import {
  type RenderVirtualListOptions,
  renderVirtualList,
} from '@/components/collections/virtual-list/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the VirtualList adapter. */
export type VirtualListBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link virtualList} adapter. */
export interface VirtualListData<TItem extends ListItem = ListItem>
  extends Omit<RenderVirtualListOptions<TItem>, 'height' | 'offset' | 'width'>,
    BoxData {
  /** Initial first visible source index. */
  defaultOffset?: number;

  /** Called after keyboard or imperative scrolling changes the offset. */
  onOffsetChange?: (offset: number) => void;

  /** Controlled first visible source index. */
  offset?: number;
}

/** Options accepted by the Blessed {@link virtualList} adapter. */
export interface VirtualListOptions<TItem extends ListItem = ListItem> {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: VirtualListBoxOptions;

  /** Items, markers, overscan, offset, and theme data. */
  data: VirtualListData<TItem>;

  /** Blessed screen or node receiving the VirtualList. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link virtualList}. */
export interface VirtualListHandle<TItem extends ListItem = ListItem>
  extends BlessedComponentHandle<VirtualListData<TItem>, blessed.Widgets.BoxElement> {
  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Returns the current first visible source index. */
  offset(): number;

  /** Moves the viewport one row backward. */
  previous(): number;

  /** Moves the viewport one row forward. */
  next(): number;

  /** Moves the viewport one page backward. */
  pageBackward(): number;

  /** Moves the viewport one page forward. */
  pageForward(): number;

  /** Moves the viewport to the first row. */
  home(): number;

  /** Moves the viewport to the last possible row. */
  end(): number;

  /** Moves the viewport to an absolute source index. */
  scrollTo(offset: number): number;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/**
 * Creates a scrollable VirtualList backed by a Blessed box.
 *
 * The adapter keeps only the visible row window in the pure renderer while
 * retaining caller control over render batching. It supports Arrow Up/Down,
 * Home/End, and Page Up/Down for viewport movement.
 */
export function virtualList<TItem extends ListItem>({
  box,
  data: initialData,
  parent,
}: VirtualListOptions<TItem>): VirtualListHandle<TItem> {
  let data = initialData;
  let uncontrolledOffset = initialData.defaultOffset ?? 0;

  const element = blessed.box({
    keys: true,
    ...box,
    content: '',
    parent,
    style: {
      ...box?.style,
      border: { ...box?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, box);
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const isControlled = (): boolean => Object.hasOwn(data, 'offset');
  const currentOffset = (): number => data.offset ?? uncontrolledOffset;

  let scrollArea = createScrollArea({
    contentSize: data.items.length,
    offset: currentOffset(),
    viewportSize: viewportSize().height,
  });

  const render = (): void => {
    const dimensions = viewportSize();
    const resizedOffset = scrollArea.setSizes({
      contentSize: data.items.length,
      viewportSize: dimensions.height,
    });
    const offset = isControlled() ? scrollArea.scrollTo(currentOffset()) : resizedOffset;

    if (!isControlled()) {
      uncontrolledOffset = offset;
    }

    element.setContent(
      renderVirtualList({
        ...(data.activeId === undefined ? {} : { activeId: data.activeId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: dimensions.height,
        items: data.items,
        offset,
        ...(data.overscan === undefined ? {} : { overscan: data.overscan }),
        ...(data.selectedId === undefined ? {} : { selectedId: data.selectedId }),
        width: dimensions.width,
      }),
    );
    style.apply({
      backgroundTone: data.backgroundTone,
      borderTone: data.borderTone,
      capabilities: data.capabilities,
      foregroundTone: data.foregroundTone,
      theme: data.theme,
    });
  };
  const setOffset = (nextOffset: number): number => {
    const previousOffset = currentOffset();
    const offset = scrollArea.scrollTo(nextOffset);

    if (!isControlled()) {
      uncontrolledOffset = offset;
    }

    if (offset !== previousOffset) {
      data.onOffsetChange?.(offset);
    }

    render();

    return offset;
  };

  render();

  const handle: VirtualListHandle<TItem> = {
    destroy() {
      element.destroy();
    },
    element,
    end: () => setOffset(data.items.length),
    focus() {
      element.focus();
    },
    home: () => setOffset(0),
    next: () => setOffset(currentOffset() + 1),
    offset: currentOffset,
    pageBackward: () => setOffset(currentOffset() - viewportSize().height),
    pageForward: () => setOffset(currentOffset() + viewportSize().height),
    previous: () => setOffset(currentOffset() - 1),
    scrollTo: setOffset,
    setData(nextData) {
      data = nextData;
      scrollArea = createScrollArea({
        contentSize: data.items.length,
        offset: currentOffset(),
        viewportSize: viewportSize().height,
      });
      render();
    },
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'down':
        handle.next();
        break;
      case 'end':
        handle.end();
        break;
      case 'home':
        handle.home();
        break;
      case 'pagedown':
        handle.pageForward();
        break;
      case 'pageup':
        handle.pageBackward();
        break;
      case 'up':
        handle.previous();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
