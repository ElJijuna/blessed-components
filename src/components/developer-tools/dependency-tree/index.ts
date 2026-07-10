import { renderPlainLines } from '@/components/shared/text.js';

/** Dependency node rendered by {@link renderDependencyTree}. */
export interface DependencyTreeNode {
  /** Child dependencies. */
  children?: readonly DependencyTreeNode[];

  /** Package name. */
  name: string;

  /** Optional problem label. */
  problem?: string;

  /** Package version. */
  version?: string;
}

/** Options accepted by {@link renderDependencyTree}. */
export interface RenderDependencyTreeOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Root dependency nodes. */
  roots: readonly DependencyTreeNode[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

function flattenNode(node: DependencyTreeNode, depth: number): string[] {
  const version = node.version === undefined ? '' : `@${node.version}`;
  const problem = node.problem === undefined ? '' : ` ! ${node.problem}`;
  const line = `${'  '.repeat(depth)}- ${node.name}${version}${problem}`;

  return [line, ...(node.children ?? []).flatMap((child) => flattenNode(child, depth + 1))];
}

/** Renders package dependencies as an indented tree. */
export function renderDependencyTree({
  height,
  roots,
  width,
}: RenderDependencyTreeOptions): string {
  return renderPlainLines(
    roots.flatMap((root) => flattenNode(root, 0)),
    { height, width },
  );
}
