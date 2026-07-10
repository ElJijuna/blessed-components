import { fitPlain, renderPlainLines } from '@/components/shared/text.js';

/** Orientation for {@link renderSplitPane}. */
export type SplitPaneOrientation = 'horizontal' | 'vertical';

/** Region metadata rendered by {@link renderSplitPane}. */
export interface SplitPaneRegion {
  /** Stable region id. */
  id: string;

  /** Visible region label. Defaults to `id`. */
  label?: string;

  /** Allocated terminal cells in the split direction. */
  size: number;
}

/** Options accepted by {@link renderSplitPane}. */
export interface RenderSplitPaneOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Split direction. */
  orientation?: SplitPaneOrientation;

  /** Regions in visual order. */
  regions: readonly SplitPaneRegion[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders split-pane region allocation as safe terminal text. */
export function renderSplitPane({
  height,
  orientation = 'horizontal',
  regions,
  width,
}: RenderSplitPaneOptions): string {
  const unit = orientation === 'horizontal' ? 'cols' : 'rows';
  const parts = regions.map((region) => {
    if (!Number.isInteger(region.size) || region.size < 0) {
      throw new RangeError('SplitPane region sizes must be non-negative integers.');
    }

    return `${region.label ?? region.id}: ${region.size} ${unit}`;
  });
  const lines = orientation === 'horizontal' ? [parts.join(' | ')] : parts;

  return renderPlainLines(
    lines.map((line) => fitPlain(line, width)),
    { height },
  );
}
