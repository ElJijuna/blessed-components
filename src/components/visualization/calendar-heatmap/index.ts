import { truncateText } from '@/core/truncate.js';

export interface CalendarHeatmapDay {
  date: string;
  value: number;
}

export interface CalendarHeatmapCharacters {
  empty: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
}

export interface RenderCalendarHeatmapOptions {
  characters?: CalendarHeatmapCharacters;
  days: readonly CalendarHeatmapDay[];
  emptyText?: string;
  height: number;
  max?: number;
  offset?: number;
  width: number;
}

const DEFAULT_CHARACTERS: CalendarHeatmapCharacters = {
  empty: '·',
  level1: '░',
  level2: '▒',
  level3: '▓',
  level4: '█',
};

function dayGlyph(value: number, max: number, characters: CalendarHeatmapCharacters): string {
  if (value <= 0) {
    return characters.empty;
  }

  const ratio = value / max;

  if (ratio <= 0.25) {
    return characters.level1;
  }

  if (ratio <= 0.5) {
    return characters.level2;
  }

  if (ratio <= 0.75) {
    return characters.level3;
  }

  return characters.level4;
}

/** Renders daily activity values as a 7-row calendar heatmap. */
export function renderCalendarHeatmap({
  characters = DEFAULT_CHARACTERS,
  days,
  emptyText = 'No activity',
  height,
  max,
  offset = 0,
  width,
}: RenderCalendarHeatmapOptions): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('CalendarHeatmap dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  if (days.length === 0) {
    return truncateText(emptyText, width);
  }

  if (days.some((day) => !Number.isFinite(day.value) || day.value < 0)) {
    throw new RangeError('CalendarHeatmap values must be non-negative finite numbers.');
  }

  const domainMax = max ?? Math.max(...days.map(({ value }) => value), 1);

  if (!Number.isFinite(domainMax) || domainMax <= 0) {
    throw new RangeError('CalendarHeatmap max must be positive and finite.');
  }

  const columnCount = Math.ceil(days.length / 7);
  const rows = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: columnCount }, (_, column) => {
      const day = days[column * 7 + row];

      return day === undefined ? ' ' : dayGlyph(day.value, domainMax, characters);
    }).join(''),
  );

  return rows
    .slice(offset, offset + height)
    .map((row) => truncateText(row, width))
    .join('\n');
}
