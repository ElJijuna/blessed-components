import { truncateText } from './truncate.js';
import { visibleWidth } from './width.js';

export interface RenderCell {
  align?: 'center' | 'left' | 'right';
  colSpan?: number;
  text: string;
  width?: number;
}

export interface RenderRow {
  cells: readonly RenderCell[];
}

export interface RenderModel {
  columnGap?: number;
  rows: readonly RenderRow[];
}

function renderCell({ align = 'left', text, width }: RenderCell): string {
  if (width === undefined) {
    return text;
  }

  const cropped = truncateText(text, width);
  const padding = Math.max(0, width - visibleWidth(cropped));

  if (align === 'right') {
    return `${' '.repeat(padding)}${cropped}`;
  }

  if (align === 'center') {
    const left = Math.floor(padding / 2);

    return `${' '.repeat(left)}${cropped}${' '.repeat(padding - left)}`;
  }

  return `${cropped}${' '.repeat(padding)}`;
}

/**
 * Renders a framework-independent row and cell model into plain text.
 */
export function renderToString({ columnGap = 0, rows }: RenderModel): string {
  return rows
    .map(({ cells }) => cells.map(renderCell).join(' '.repeat(columnGap)).trimEnd())
    .join('\n');
}

/**
 * Returns row indexes that differ between two rendered frames.
 */
export function diffRows(previous: readonly string[], next: readonly string[]): number[] {
  const rowCount = Math.max(previous.length, next.length);

  return Array.from({ length: rowCount }, (_, index) => index).filter(
    (index) => previous[index] !== next[index],
  );
}
