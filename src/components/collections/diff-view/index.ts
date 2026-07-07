import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Semantic kind for one rendered diff row. */
export type DiffViewLineType = 'add' | 'context' | 'hunk' | 'remove';

/** Structured row accepted by DiffView. */
export interface DiffViewLine {
  /** Source text for this row. ANSI sequences and Blessed tags are stripped. */
  content: string;

  /** New-file line number, omitted for removed lines and hunk headers. */
  newLine?: number;

  /** Old-file line number, omitted for added lines and hunk headers. */
  oldLine?: number;

  /** Row kind. */
  type: DiffViewLineType;
}

/** Character tokens used by {@link renderDiffView}. */
export interface DiffViewCharacters {
  /** Marker shown beside added rows. */
  add: string;

  /** Marker shown beside unchanged context rows. */
  context: string;

  /** Marker shown beside hunk header rows. */
  hunk: string;

  /** Marker shown beside removed rows. */
  remove: string;
}

/** Options accepted by {@link renderDiffView}. */
export interface RenderDiffViewOptions {
  /** Character tokens for row state. */
  characters?: DiffViewCharacters;

  /** Text displayed when no diff lines exist. */
  emptyText?: string;

  /** Maximum rendered row count. */
  height: number;

  /** Line number column width. Defaults to the widest visible line number. */
  lineNumberWidth?: number;

  /** Structured diff rows. Caller-owned data is never mutated. */
  lines: readonly DiffViewLine[];

  /** First rendered diff row index. @defaultValue `0` */
  offset?: number;

  /** Whether to include old and new line number columns. @defaultValue `true` */
  showLineNumbers?: boolean;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: DiffViewCharacters = {
  add: '+',
  context: ' ',
  hunk: '@',
  remove: '-',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertDimensions(
  height: number,
  width: number,
  offset: number,
  lineNumberWidth: number | undefined,
): void {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    (lineNumberWidth !== undefined && (!Number.isInteger(lineNumberWidth) || lineNumberWidth < 1))
  ) {
    throw new RangeError(
      'DiffView dimensions, offset, and lineNumberWidth must be non-negative integers.',
    );
  }
}

function formatLineNumber(value: number | undefined, width: number): string {
  return value === undefined ? ' '.repeat(width) : String(value).padStart(width, ' ');
}

function inferredLineNumberWidth(lines: readonly DiffViewLine[]): number {
  return Math.max(
    1,
    ...lines
      .flatMap((line) => [line.oldLine, line.newLine])
      .map((value) => String(value ?? '').length),
  );
}

function renderDiffLine({
  characters,
  line,
  lineNumberWidth,
  showLineNumbers,
  width,
}: {
  characters: DiffViewCharacters;
  line: DiffViewLine;
  lineNumberWidth: number;
  showLineNumbers: boolean;
  width: number;
}): string {
  const marker = characters[line.type];
  const content = plainText(line.content);

  if (!showLineNumbers) {
    return truncateText(`${marker} ${content}`, width);
  }

  const oldLine = formatLineNumber(line.oldLine, lineNumberWidth);
  const newLine = formatLineNumber(line.newLine, lineNumberWidth);

  return truncateText(`${oldLine} ${newLine} ${marker} ${content}`, width);
}

/** Renders a bounded, terminal-cell-aware unified diff viewport. */
export function renderDiffView({
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No diff',
  height,
  lineNumberWidth,
  lines,
  offset = 0,
  showLineNumbers = true,
  width,
}: RenderDiffViewOptions): string {
  assertDimensions(height, width, offset, lineNumberWidth);

  if (height === 0) {
    return '';
  }

  if (lines.length === 0) {
    return truncateText(emptyText, width);
  }

  const numberWidth = lineNumberWidth ?? inferredLineNumberWidth(lines);

  return lines
    .slice(offset, offset + height)
    .map((line) =>
      renderDiffLine({
        characters,
        line,
        lineNumberWidth: numberWidth,
        showLineNumbers,
        width,
      }),
    )
    .join('\n');
}
