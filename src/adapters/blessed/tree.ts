import blessed from 'blessed';

import {
  flattenTreeRows,
  renderTree,
  type TreeCharacters,
  type TreeNode,
} from '@/components/collections/tree/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Tree adapter. */
export type TreeBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link tree} adapter. */
export interface TreeData<TNode extends TreeNode = TreeNode> {
  /** Preferred initial cursor identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: TreeCharacters;

  /** Initial expanded node identifiers for uncontrolled expansion. */
  defaultExpandedIds?: readonly string[];

  /** Initial selection for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no nodes exist. */
  emptyText?: string;

  /** Controlled expanded node identifiers. */
  expandedIds?: readonly string[];

  /** Spaces inserted for each nesting depth. @defaultValue `2` */
  indent?: number;

  /** Ordered root nodes. Disabled nodes are visible but not interactive. */
  nodes: readonly TNode[];

  /** Called after the cursor moves to a different enabled node. */
  onActiveIdChange?: (activeId: string) => void;

  /** Called when expansion changes or is requested in controlled mode. */
  onExpandedIdsChange?: (expandedIds: readonly string[]) => void;

  /** Called when Enter or {@link TreeHandle.selectActive} requests selection. */
  onValueChange?: (value: string) => void;

  /** Controlled selected identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link tree} adapter. */
export interface TreeOptions<TNode extends TreeNode = TreeNode> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: TreeBoxOptions;

  /** Nodes, controlled or uncontrolled state, and change listeners. */
  data: TreeData<TNode>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link tree}. */
export interface TreeHandle<TNode extends TreeNode = TreeNode>
  extends BlessedComponentHandle<TreeData<TNode>, blessed.Widgets.BoxElement> {
  /** Collapses a node id, or the active node when omitted. */
  collapse(id?: string): readonly string[];

  /** Expands a node id, or the active node when omitted. */
  expand(id?: string): readonly string[];

  /** Returns the current enabled cursor identifier. */
  activeId(): string | undefined;

  /** Returns the current controlled or uncontrolled expanded identifiers. */
  expandedIds(): readonly string[];

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves the cursor to an enabled identifier. */
  focusItem(id: string): string | undefined;

  /** Moves the cursor to the first enabled visible node. */
  first(): string | undefined;

  /** Moves the cursor to the last enabled visible node. */
  last(): string | undefined;

  /** Moves the cursor to the next enabled visible node, wrapping at the end. */
  next(): string | undefined;

  /** Moves the cursor one viewport page backward. */
  pageBackward(): string | undefined;

  /** Moves the cursor one viewport page forward. */
  pageForward(): string | undefined;

  /** Moves the cursor to the previous enabled visible node, wrapping at the start. */
  previous(): string | undefined;

  /** Selects the active node or emits a controlled selection request. */
  selectActive(): string | undefined;

  /** Toggles the active expandable node. */
  toggleActive(): readonly string[];

  /** Returns the current controlled or uncontrolled selected identifier. */
  value(): string | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

interface MouseEvent {
  y?: number;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function absoluteElementTop(element: blessed.Widgets.BoxElement): number {
  const positionedElement = element as blessed.Widgets.BoxElement & {
    atop?: blessed.Widgets.Types.TPosition;
  };

  return numericDimension(positionedElement.atop ?? positionedElement.top);
}

function collectNodes<TNode extends TreeNode>(nodes: readonly TNode[]): readonly TNode[] {
  return nodes.flatMap((node) => [
    node,
    ...collectNodes((node.children ?? []) as readonly TNode[]),
  ]);
}

function compactExpandedIds<TNode extends TreeNode>(
  expandedIds: readonly string[],
  nodes: readonly TNode[],
): readonly string[] {
  const expandableIds = new Set(
    collectNodes(nodes)
      .filter((node) => (node.children ?? []).length > 0)
      .map((node) => node.id),
  );

  return expandedIds.filter(
    (id, index) => expandableIds.has(id) && expandedIds.indexOf(id) === index,
  );
}

/** Creates an interactive expandable Tree backed by a Blessed box. */
export function tree<TNode extends TreeNode>({
  box,
  data: initialData,
  parent,
}: TreeOptions<TNode>): TreeHandle<TNode> {
  let data = initialData;
  let uncontrolledExpandedIds = compactExpandedIds(
    initialData.defaultExpandedIds ?? [],
    data.nodes,
  );
  let uncontrolledValue = initialData.defaultValue;
  let currentActiveId = initialData.activeId;
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
  const isExpansionControlled = (): boolean => Object.hasOwn(data, 'expandedIds');
  const selectedValue = (): string | undefined =>
    isValueControlled() ? data.value : uncontrolledValue;
  const expandedIdList = (): readonly string[] =>
    isExpansionControlled()
      ? compactExpandedIds(data.expandedIds ?? [], data.nodes)
      : uncontrolledExpandedIds;
  const expandedIdSet = (): ReadonlySet<string> => new Set(expandedIdList());
  const rows = () => flattenTreeRows({ expandedIds: expandedIdSet(), nodes: data.nodes });
  const visibleItems = () => rows().map((row) => row.node);
  const initialValue = selectedValue();

  let focusScope = createFocusScope({ items: visibleItems() });
  let selection = createSelectionModel({
    defaultSelectedIds: initialValue === undefined ? [] : [initialValue],
    items: collectNodes(data.nodes),
  });
  let scrollArea = createScrollArea({
    contentSize: rows().length,
    viewportSize: viewportSize().height,
  });

  const rowIndexForItem = (id: string | undefined): number =>
    rows().findIndex((row) => row.node.id === id);
  const render = (): void => {
    const dimensions = viewportSize();
    const value = selectedValue();

    scrollArea.setSizes({
      contentSize: rows().length,
      viewportSize: dimensions.height,
    });
    offset = scrollArea.scrollTo(offset);
    element.setContent(
      renderTree({
        ...(currentActiveId === undefined ? {} : { activeId: currentActiveId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        expandedIds: expandedIdSet(),
        height: dimensions.height,
        ...(data.indent === undefined ? {} : { indent: data.indent }),
        nodes: data.nodes,
        offset,
        ...(value === undefined ? {} : { selectedId: value }),
        width: dimensions.width,
      }),
    );
  };
  const ensureActiveVisible = (): void => {
    const index = rowIndexForItem(currentActiveId);
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
  const focusNearestRow = (
    rowIndex: number,
    direction: 'backward' | 'forward',
  ): string | undefined => {
    const step = direction === 'forward' ? 1 : -1;
    const allRows = rows();

    for (
      let candidateIndex = rowIndex;
      candidateIndex >= 0 && candidateIndex < allRows.length;
      candidateIndex += step
    ) {
      const candidate = allRows[candidateIndex];

      if (candidate === undefined) {
        continue;
      }

      if (candidate?.node.disabled !== true) {
        return setActive(focusScope.focus(candidate.node.id));
      }
    }

    return currentActiveId;
  };
  const rebuildModels = (): void => {
    const previousActiveId = currentActiveId;
    const interactiveItems = visibleItems();

    focusScope = createFocusScope({
      ...(data.activeId === undefined ? {} : { initialFocusId: data.activeId }),
      items: interactiveItems,
    });
    currentActiveId = focusScope.activate();

    if (
      data.activeId === undefined &&
      previousActiveId !== undefined &&
      interactiveItems.some(({ disabled, id }) => id === previousActiveId && disabled !== true)
    ) {
      currentActiveId = focusScope.focus(previousActiveId);
    }

    const currentValue = selectedValue();

    selection = createSelectionModel({
      defaultSelectedIds: currentValue === undefined ? [] : [currentValue],
      items: collectNodes(data.nodes),
    });
    scrollArea = createScrollArea({
      contentSize: rows().length,
      offset,
      viewportSize: viewportSize().height,
    });
    ensureActiveVisible();
  };
  const setExpandedIds = (nextExpandedIds: readonly string[]): readonly string[] => {
    const compacted = compactExpandedIds(nextExpandedIds, data.nodes);

    if (isExpansionControlled()) {
      data.onExpandedIdsChange?.(compacted);
    } else {
      uncontrolledExpandedIds = compacted;
      data.onExpandedIdsChange?.(compacted);
      rebuildModels();
      render();
    }

    return compacted;
  };
  const updateExpandedId = (id: string | undefined, expanded: boolean): readonly string[] => {
    if (id === undefined) {
      return expandedIdList();
    }

    const current = expandedIdList();
    const next = expanded ? [...current, id] : current.filter((expandedId) => expandedId !== id);

    return setExpandedIds(next);
  };
  const rowIndexAtY = (screenY: number): number | undefined => {
    const row = screenY - absoluteElementTop(element) - numericDimension(element.itop);

    if (!Number.isInteger(row) || row < 0 || row >= viewportSize().height) {
      return undefined;
    }

    const index = offset + row;

    return index >= rows().length ? undefined : index;
  };

  focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  ensureActiveVisible();
  render();

  const handle: TreeHandle<TNode> = {
    activeId: () => currentActiveId,
    collapse: (id) => updateExpandedId(id ?? currentActiveId, false),
    destroy() {
      element.destroy();
    },
    element,
    expand: (id) => updateExpandedId(id ?? currentActiveId, true),
    expandedIds: expandedIdList,
    first: () => focusNearestRow(0, 'forward'),
    focus() {
      element.focus();
    },
    focusItem: (id) => setActive(focusScope.focus(id)),
    last: () => focusNearestRow(rows().length - 1, 'backward'),
    next: () => setActive(focusScope.next()),
    pageBackward() {
      const nextOffset = scrollArea.pageBackward();

      return focusNearestRow(nextOffset, 'backward');
    },
    pageForward() {
      const nextOffset = scrollArea.pageForward();

      return focusNearestRow(nextOffset, 'forward');
    },
    previous: () => setActive(focusScope.previous()),
    selectActive() {
      if (currentActiveId === undefined) {
        return undefined;
      }

      if (isValueControlled()) {
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

      if (isValueControlled()) {
        uncontrolledValue = undefined;
      } else if (
        uncontrolledValue !== undefined &&
        !collectNodes(data.nodes).some(
          ({ disabled, id }) => id === uncontrolledValue && disabled !== true,
        )
      ) {
        uncontrolledValue = data.defaultValue;
      }

      if (isExpansionControlled()) {
        uncontrolledExpandedIds = [];
      } else {
        uncontrolledExpandedIds = compactExpandedIds(uncontrolledExpandedIds, data.nodes);
      }

      rebuildModels();
      render();
    },
    toggleActive() {
      const row = rows().find(({ node }) => node.id === currentActiveId);

      if (row === undefined || !row.expandable) {
        return expandedIdList();
      }

      return updateExpandedId(row.node.id, !row.expanded);
    },
    value: selectedValue,
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'down':
        handle.next();
        break;
      case 'end':
        handle.last();
        break;
      case 'enter':
        handle.selectActive();
        break;
      case 'home':
        handle.first();
        break;
      case 'left':
        handle.collapse();
        break;
      case 'pagedown':
        handle.pageForward();
        break;
      case 'pageup':
        handle.pageBackward();
        break;
      case 'right':
        handle.expand();
        break;
      case 'space':
        handle.toggleActive();
        break;
      case 'up':
        handle.previous();
        break;
    }
  });
  element.on('click', (event: MouseEvent) => {
    if (event.y === undefined) {
      return;
    }

    const index = rowIndexAtY(event.y);

    if (index === undefined) {
      return;
    }

    const row = rows()[index];

    if (row === undefined || row.node.disabled === true) {
      return;
    }

    setActive(focusScope.focus(row.node.id));

    if (row.expandable) {
      handle.toggleActive();
    } else {
      handle.selectActive();
    }
  });
  element.on('resize', render);
  element.on('wheeldown', () => {
    handle.next();
  });
  element.on('wheelup', () => {
    handle.previous();
  });

  return handle;
}
