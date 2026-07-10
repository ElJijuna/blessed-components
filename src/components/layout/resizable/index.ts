import { renderPlainLines } from '@/components/shared/text.js';

/** Resizable axis. */
export type ResizableOrientation = 'horizontal' | 'vertical';

/** Options accepted by {@link clampResizableSize}. */
export interface ResizableSizeOptions {
  /** Maximum size. */
  max?: number;

  /** Minimum size. */
  min?: number;

  /** Requested size. */
  size: number;
}

/** Options accepted by {@link renderResizable}. */
export interface RenderResizableOptions extends ResizableSizeOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Region label. */
  label: string;

  /** Resize axis. */
  orientation?: ResizableOrientation;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Clamps a resizable region to optional bounds. */
export function clampResizableSize({
  max = Number.POSITIVE_INFINITY,
  min = 0,
  size,
}: ResizableSizeOptions): number {
  if (![max, min, size].every(Number.isFinite) || max < min) {
    throw new RangeError('Resizable sizes must be finite and ordered.');
  }

  return Math.min(max, Math.max(min, size));
}

/** Renders resize state for one region. */
export function renderResizable({
  height,
  label,
  max,
  min = 0,
  orientation = 'horizontal',
  size,
  width,
}: RenderResizableOptions): string {
  const unit = orientation === 'horizontal' ? 'cols' : 'rows';
  const clamped = clampResizableSize(max === undefined ? { min, size } : { max, min, size });
  const maxText = max === undefined ? 'unbounded' : String(max);

  return renderPlainLines([`${label}: ${clamped} ${unit} (min ${min}, max ${maxText})`], {
    height,
    width,
  });
}
