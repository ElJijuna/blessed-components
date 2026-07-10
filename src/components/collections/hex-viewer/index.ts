import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderHexViewer}. */
export interface RenderHexViewerOptions {
  /** Bytes to render. */
  bytes: readonly number[];

  /** Bytes per row. */
  columns?: number;

  /** Maximum rendered height. */
  height?: number;

  /** Starting offset. */
  offset?: number;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders byte offsets, hex bytes, and ASCII preview. */
export function renderHexViewer({
  bytes,
  columns = 8,
  height,
  offset = 0,
  width,
}: RenderHexViewerOptions): string {
  if (!Number.isInteger(columns) || columns < 1 || !Number.isInteger(offset) || offset < 0) {
    throw new RangeError('HexViewer columns must be positive and offset non-negative.');
  }

  const lines = [];

  for (let index = 0; index < bytes.length; index += columns) {
    const row = bytes.slice(index, index + columns);
    const hex = row.map((byte) => {
      if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
        throw new RangeError('HexViewer bytes must be integers from 0 to 255.');
      }

      return byte.toString(16).padStart(2, '0');
    });
    const ascii = row
      .map((byte) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.'))
      .join('');

    lines.push(`${(offset + index).toString(16).padStart(8, '0')}  ${hex.join(' ')}  ${ascii}`);
  }

  return renderPlainLines(lines, { height, width });
}
