import { stripBlessedTags } from '@/core/tags.js';
import { truncateText, wrapText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

export interface RenderTextAreaOptions {
  cursorLine?: number;
  emptyText?: string;
  height: number;
  lineNumbers?: boolean;
  maxLength?: number;
  offset?: number;
  value: string;
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertViewport(height: number, width: number, offset: number): void {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('TextArea dimensions and offset must be non-negative integers.');
  }
}

/** Renders bounded multiline text with optional line numbers and cursor marker. */
export function renderTextArea({
  cursorLine,
  emptyText = 'No text',
  height,
  lineNumbers = false,
  maxLength,
  offset = 0,
  value,
  width,
}: RenderTextAreaOptions): string {
  assertViewport(height, width, offset);

  if (height === 0 || width === 0) {
    return '';
  }

  if (maxLength !== undefined && (!Number.isInteger(maxLength) || maxLength < 0)) {
    throw new RangeError('TextArea maxLength must be a non-negative integer.');
  }

  const safeValue = plainText(value);
  const clippedValue = maxLength === undefined ? safeValue : safeValue.slice(0, maxLength);
  const sourceLines = clippedValue.length === 0 ? [plainText(emptyText)] : clippedValue.split('\n');
  const numberWidth = lineNumbers ? String(sourceLines.length).length : 0;
  const contentWidth = Math.max(1, width - (lineNumbers ? numberWidth + 3 : 0));
  const rows = sourceLines.flatMap((line, lineIndex) => {
    const wrapped = wrapText(line, contentWidth);

    return wrapped.length === 0
      ? [{ line: '', sourceLineIndex: lineIndex }]
      : wrapped.map((row) => ({ line: row, sourceLineIndex: lineIndex }));
  });

  return rows
    .slice(offset, offset + height)
    .map(({ line, sourceLineIndex }) => {
      const cursor = cursorLine === sourceLineIndex ? '›' : ' ';
      const prefix = lineNumbers
        ? `${cursor}${String(sourceLineIndex + 1).padStart(numberWidth, ' ')} `
        : '';

      return truncateText(`${prefix}${line}`, width);
    })
    .join('\n');
}
