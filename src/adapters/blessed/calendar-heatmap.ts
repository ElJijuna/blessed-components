import type blessed from 'blessed';

import {
  type RenderCalendarHeatmapOptions,
  renderCalendarHeatmap,
} from '@/components/visualization/calendar-heatmap/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type CalendarHeatmapBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export type CalendarHeatmapData = Omit<RenderCalendarHeatmapOptions, 'height' | 'width'>;
export interface CalendarHeatmapOptions {
  box?: CalendarHeatmapBoxOptions;
  data: CalendarHeatmapData;
  parent: blessed.Widgets.Node;
}
export type CalendarHeatmapHandle = BlessedComponentHandle<
  CalendarHeatmapData,
  blessed.Widgets.BoxElement
>;

/** Creates a render-only CalendarHeatmap backed by a Blessed box. */
export function calendarHeatmap({
  box,
  data,
  parent,
}: CalendarHeatmapOptions): CalendarHeatmapHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { height, width }) => renderCalendarHeatmap({ ...nextData, height, width }),
  });
}
