import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderDateRangePicker}. */
export interface RenderDateRangePickerOptions {
  /** End ISO date. */
  end?: string;

  /** Maximum rendered height. */
  height?: number;

  /** Start ISO date. */
  start?: string;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders a bounded date interval preview. */
export function renderDateRangePicker({
  end,
  height,
  start,
  width,
}: RenderDateRangePickerOptions): string {
  return renderPlainLines([`start: ${start ?? 'unset'}`, `end: ${end ?? 'unset'}`], {
    height,
    width,
  });
}
