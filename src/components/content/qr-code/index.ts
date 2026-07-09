import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderQrCode}. */
export interface RenderQrCodeOptions {
  /** Boolean QR/module matrix. `true` renders a filled cell. */
  matrix: readonly (readonly boolean[])[];

  /** Maximum rendered height. */
  height?: number;

  /** Filled module glyph. */
  on?: string;

  /** Empty module glyph. */
  off?: string;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders a supplied QR/module matrix using terminal-safe cells. */
export function renderQrCode({
  height,
  matrix,
  off = '  ',
  on = '██',
  width,
}: RenderQrCodeOptions): string {
  if (matrix.length === 0 || matrix.some((row) => row.length !== matrix[0]?.length)) {
    throw new RangeError('QrCode matrix must be rectangular and non-empty.');
  }

  const lines = matrix.map((row) => row.map((cell) => (cell ? on : off)).join(''));

  return renderPlainLines(lines, { height, width });
}
