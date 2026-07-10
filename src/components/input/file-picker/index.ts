import { fitPlain, renderPlainLines } from '@/components/shared/text.js';

/** File picker entry rendered by {@link renderFilePicker}. */
export interface FilePickerEntry {
  /** Entry basename. */
  name: string;

  /** Full or relative path. */
  path: string;

  /** Entry kind. */
  type: 'directory' | 'file';
}

/** Options accepted by {@link renderFilePicker}. */
export interface RenderFilePickerOptions {
  /** Current directory label. */
  cwd: string;

  /** Entries in visual order. */
  entries: readonly FilePickerEntry[];

  /** Maximum rendered height. */
  height?: number;

  /** Selected entry path. */
  selectedPath?: string;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders file/directory choices without touching the filesystem. */
export function renderFilePicker({
  cwd,
  entries,
  height,
  selectedPath,
  width,
}: RenderFilePickerOptions): string {
  const lines = [
    `cwd: ${cwd}`,
    ...entries.map((entry) => {
      const marker = entry.path === selectedPath ? '>' : ' ';
      const kind = entry.type === 'directory' ? '[D]' : '[F]';

      return fitPlain(`${marker} ${kind} ${entry.name}`, width);
    }),
  ];

  return renderPlainLines(lines, { height, width });
}
