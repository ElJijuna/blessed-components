import { renderPlainLines } from '@/components/shared/text.js';

/** Commit row rendered by {@link renderCommitList}. */
export interface CommitListItem {
  /** Author display name. */
  author?: string;

  /** Commit hash. */
  hash: string;

  /** Commit subject. */
  message: string;

  /** Ref names attached to the commit. */
  refs?: readonly string[];
}

/** Options accepted by {@link renderCommitList}. */
export interface RenderCommitListOptions {
  /** Commits in visual order. */
  commits: readonly CommitListItem[];

  /** Maximum rendered height. */
  height?: number;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders commit summaries with short hashes and refs. */
export function renderCommitList({ commits, height, width }: RenderCommitListOptions): string {
  const lines = commits.map((commit) => {
    const refs =
      commit.refs === undefined || commit.refs.length === 0 ? '' : ` (${commit.refs.join(', ')})`;
    const author = commit.author === undefined ? '' : ` - ${commit.author}`;

    return `${commit.hash.slice(0, 7)}${refs} ${commit.message}${author}`;
  });

  return renderPlainLines(lines, { height, width });
}
