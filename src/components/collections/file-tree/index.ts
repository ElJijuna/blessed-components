import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** File-specific tree node. */
export interface FileTreeNode {
  /** Child nodes. Directories may omit children when collapsed or unloaded. */
  children?: readonly FileTreeNode[];

  /** Whether navigation and selection must skip this node. */
  disabled?: boolean;

  /** Optional git status marker. */
  gitStatus?: 'conflict' | 'deleted' | 'ignored' | 'modified' | 'staged' | 'untracked';

  /** Stable node identifier, usually a path. */
  id: string;

  /** File or directory kind. */
  kind: 'directory' | 'file';

  /** Display name. */
  label: string;
}

/** Character tokens used by {@link renderFileTree}. */
export interface FileTreeCharacters {
  active: string;
  collapsed: string;
  conflict: string;
  deleted: string;
  directory: string;
  disabled: string;
  expanded: string;
  file: string;
  ignored: string;
  modified: string;
  selected: string;
  staged: string;
  untracked: string;
}

/** Options accepted by {@link renderFileTree}. */
export interface RenderFileTreeOptions<TNode extends FileTreeNode = FileTreeNode> {
  activeId?: string;
  characters?: FileTreeCharacters;
  emptyText?: string;
  expandedIds?: ReadonlySet<string>;
  height: number;
  indent?: number;
  nodes: readonly TNode[];
  offset?: number;
  selectedId?: string;
  width: number;
}

interface FileTreeRow<TNode extends FileTreeNode> {
  depth: number;
  expandable: boolean;
  expanded: boolean;
  node: TNode;
}

const DEFAULT_CHARACTERS: FileTreeCharacters = {
  active: '›',
  collapsed: '▸',
  conflict: '!',
  deleted: 'D',
  directory: 'd',
  disabled: '×',
  expanded: '▾',
  file: 'f',
  ignored: 'I',
  modified: 'M',
  selected: '●',
  staged: 'S',
  untracked: '?',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).trim();
}

function flattenFileTree<TNode extends FileTreeNode>(
  nodes: readonly TNode[],
  expandedIds: ReadonlySet<string>,
): readonly FileTreeRow<TNode>[] {
  const rows: FileTreeRow<TNode>[] = [];
  const visit = (node: TNode, depth: number): void => {
    const children = node.children ?? [];
    const expandable = node.kind === 'directory' && children.length > 0;
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

/** Renders an expandable file tree with type and git-state markers. */
export function renderFileTree<TNode extends FileTreeNode>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No files',
  expandedIds = new Set(),
  height,
  indent = 2,
  nodes,
  offset = 0,
  selectedId,
  width,
}: RenderFileTreeOptions<TNode>): string {
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
    throw new RangeError('FileTree dimensions, offset, and indent must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  const rows = flattenFileTree(nodes, expandedIds);

  if (rows.length === 0) {
    return truncateText(plainText(emptyText), width);
  }

  return rows
    .slice(offset, offset + height)
    .map(({ depth, expandable, expanded, node }) => {
      const label = plainText(node.label);

      if (node.id.length === 0 || label.length === 0) {
        throw new RangeError('FileTree ids and labels must be non-empty.');
      }

      const cursor = node.id === activeId ? characters.active : ' ';
      const state =
        node.disabled === true
          ? characters.disabled
          : node.id === selectedId
            ? characters.selected
            : ' ';
      const toggle = expandable ? (expanded ? characters.expanded : characters.collapsed) : ' ';
      const kind = node.kind === 'directory' ? characters.directory : characters.file;
      const git = node.gitStatus === undefined ? ' ' : characters[node.gitStatus];

      return truncateText(
        `${' '.repeat(depth * indent)}${cursor} ${state} ${toggle} ${kind} ${git} ${label}`,
        width,
      );
    })
    .join('\n');
}
