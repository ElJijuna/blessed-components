import { truncateText } from '@/core/truncate.js';

/** Minimum data required for one Tree node. */
export interface TreeNode {
  /** Child nodes. Omitted or empty children make this a leaf node. */
  children?: readonly TreeNode[];

  /** Whether navigation and selection must skip this node. */
  disabled?: boolean;

  /** Stable identifier used for expansion, cursor, and selection state. */
  id: string;

  /** Human-readable node content. */
  label: string;
}

/** Flattened visible row produced by {@link flattenTreeRows}. */
export interface TreeRow<TNode extends TreeNode = TreeNode> {
  /** Zero-based nesting depth. */
  depth: number;

  /** Whether the node has child nodes. */
  expandable: boolean;

  /** Whether an expandable node is currently expanded. */
  expanded: boolean;

  /** Original caller-owned node. */
  node: TNode;
}

/** Character tokens used by {@link renderTree}. */
export interface TreeCharacters {
  /** Marker shown beside the active row. */
  active: string;

  /** Marker shown beside a collapsed expandable node. */
  collapsed: string;

  /** Marker shown beside a disabled row. */
  disabled: string;

  /** Marker shown beside an expanded node. */
  expanded: string;

  /** Marker shown beside an enabled leaf or idle row. */
  idle: string;

  /** Marker shown beside the selected row. */
  selected: string;
}

/** Options accepted by {@link flattenTreeRows}. */
export interface FlattenTreeRowsOptions<TNode extends TreeNode = TreeNode> {
  /** Set of expanded node identifiers. */
  expandedIds?: ReadonlySet<string>;

  /** Ordered root nodes. Caller-owned data is never mutated. */
  nodes: readonly TNode[];
}

/** Options accepted by {@link renderTree}. */
export interface RenderTreeOptions<TNode extends TreeNode = TreeNode>
  extends FlattenTreeRowsOptions<TNode> {
  /** Identifier receiving the visible cursor marker. */
  activeId?: string;

  /** Character tokens used to communicate row state without color. */
  characters?: TreeCharacters;

  /**
   * Text returned when there are no visible nodes.
   *
   * @defaultValue `'No nodes'`
   */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Spaces inserted for each nesting depth. @defaultValue `2` */
  indent?: number;

  /** First rendered row index. @defaultValue `0` */
  offset?: number;

  /** Identifier receiving the selected marker. */
  selectedId?: string;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: TreeCharacters = {
  active: '›',
  collapsed: '▸',
  disabled: '×',
  expanded: '▾',
  idle: ' ',
  selected: '●',
};

function assertDimensions(height: number, width: number, offset: number, indent: number): void {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    !Number.isInteger(indent) ||
    indent < 0
  ) {
    throw new RangeError('Tree dimensions, offset, and indent must be non-negative integers.');
  }
}

/**
 * Flattens expanded Tree nodes into visible rows.
 *
 * Children are visited only when their parent id is present in `expandedIds`.
 * The returned rows reference caller-owned nodes without mutating them.
 */
export function flattenTreeRows<TNode extends TreeNode>({
  expandedIds = new Set(),
  nodes,
}: FlattenTreeRowsOptions<TNode>): readonly TreeRow<TNode>[] {
  const rows: TreeRow<TNode>[] = [];
  const visit = (node: TNode, depth: number): void => {
    const children = node.children ?? [];
    const expandable = children.length > 0;
    const expanded = expandable && expandedIds.has(node.id);

    rows.push({ depth, expandable, expanded, node });

    if (expanded) {
      for (const child of children) {
        visit(child as TNode, depth + 1);
      }
    }
  };

  for (const node of nodes) {
    visit(node, 0);
  }

  return rows;
}

/** Renders a bounded, expandable terminal tree viewport. */
export function renderTree<TNode extends TreeNode>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No nodes',
  expandedIds,
  height,
  indent = 2,
  nodes,
  offset = 0,
  selectedId,
  width,
}: RenderTreeOptions<TNode>): string {
  assertDimensions(height, width, offset, indent);

  if (height === 0) {
    return '';
  }

  const rows = flattenTreeRows({
    ...(expandedIds === undefined ? {} : { expandedIds }),
    nodes,
  });

  if (rows.length === 0) {
    return truncateText(emptyText, width);
  }

  return rows
    .slice(offset, offset + height)
    .map(({ depth, expandable, expanded, node }) => {
      const cursor = node.id === activeId ? characters.active : ' ';
      const state =
        node.disabled === true
          ? characters.disabled
          : node.id === selectedId
            ? characters.selected
            : characters.idle;
      const toggle = expandable ? (expanded ? characters.expanded : characters.collapsed) : ' ';

      return truncateText(
        `${' '.repeat(depth * indent)}${cursor} ${state} ${toggle} ${node.label}`,
        width,
      );
    })
    .join('\n');
}
