import { renderPlainLines } from '@/components/shared/text.js';

/** Git file state rendered by {@link renderGitStatus}. */
export type GitFileState = 'conflict' | 'modified' | 'staged' | 'untracked';

/** Git file row. */
export interface GitStatusFile {
  /** File path. */
  path: string;

  /** File state. */
  state: GitFileState;
}

/** Options accepted by {@link renderGitStatus}. */
export interface RenderGitStatusOptions {
  /** Branch name. */
  branch: string;

  /** Changed files. */
  files: readonly GitStatusFile[];

  /** Maximum rendered height. */
  height?: number;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

const STATE_LABEL: Record<GitFileState, string> = {
  conflict: 'conflict',
  modified: 'modified',
  staged: 'staged',
  untracked: 'untracked',
};

/** Renders branch and changed file groups. */
export function renderGitStatus({ branch, files, height, width }: RenderGitStatusOptions): string {
  const groups: GitFileState[] = ['conflict', 'staged', 'modified', 'untracked'];
  const lines = [
    `branch: ${branch}`,
    ...groups.flatMap((state) => {
      const group = files.filter((file) => file.state === state);

      return group.length === 0
        ? []
        : [`${STATE_LABEL[state]}:`, ...group.map((file) => `  ${file.path}`)];
    }),
  ];

  return renderPlainLines(lines, { height, width });
}
