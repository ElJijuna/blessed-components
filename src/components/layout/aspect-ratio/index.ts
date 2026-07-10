import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link calculateAspectRatioSize}. */
export interface AspectRatioSizeOptions {
  /** Ratio height portion. */
  ratioHeight: number;

  /** Ratio width portion. */
  ratioWidth: number;

  /** Available terminal-cell width. */
  width: number;
}

/** Options accepted by {@link renderAspectRatio}. */
export interface RenderAspectRatioOptions extends AspectRatioSizeOptions {
  /** Maximum rendered height. */
  height?: number;
}

/** Calculates a terminal-cell height that preserves a requested ratio. */
export function calculateAspectRatioSize({
  ratioHeight,
  ratioWidth,
  width,
}: AspectRatioSizeOptions): { height: number; width: number } {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isFinite(ratioWidth) ||
    !Number.isFinite(ratioHeight) ||
    ratioWidth <= 0 ||
    ratioHeight <= 0
  ) {
    throw new RangeError('AspectRatio width must be non-negative and ratio must be positive.');
  }

  return { height: Math.round((width * ratioHeight) / ratioWidth), width };
}

/** Renders resolved terminal-cell aspect ratio dimensions. */
export function renderAspectRatio(options: RenderAspectRatioOptions): string {
  const size = calculateAspectRatioSize(options);

  return renderPlainLines(
    [`${size.width}x${size.height} (${options.ratioWidth}:${options.ratioHeight})`],
    {
      height: options.height,
    },
  );
}
