import {
  type RenderColorSwatchOptions,
  renderColorSwatch,
} from '@/components/data-display/color-swatch/index.js';

export interface PaletteItem {
  color: string;
  id: string;
  label: string;
}

export interface RenderPaletteOptions {
  emptyText?: string;
  height: number;
  items: readonly PaletteItem[];
  offset?: number;
  swatch?: Pick<RenderColorSwatchOptions, 'marker'>;
  width: number;
}

/** Renders a bounded list of color swatches. */
export function renderPalette({
  emptyText = 'No colors',
  height,
  items,
  offset = 0,
  swatch,
  width,
}: RenderPaletteOptions): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('Palette dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  if (items.length === 0) {
    return renderColorSwatch({ color: emptyText, label: emptyText, marker: '-', width });
  }

  return items
    .slice(offset, offset + height)
    .map((item) =>
      renderColorSwatch({
        color: item.color,
        label: item.label,
        ...(swatch?.marker === undefined ? {} : { marker: swatch.marker }),
        width,
      }),
    )
    .join('\n');
}
