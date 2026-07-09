import { renderPlainLines } from '@/components/shared/text.js';

/** Event severity. */
export type EventLogLevel = 'debug' | 'error' | 'info' | 'warn';

/** Event log item. */
export interface EventLogItem {
  /** Event level. */
  level?: EventLogLevel;

  /** Message text. */
  message: string;

  /** Optional event scope. */
  scope?: string;

  /** Optional timestamp label. */
  time?: string;
}

/** Options accepted by {@link renderEventLog}. */
export interface RenderEventLogOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Events ordered oldest to newest. */
  items: readonly EventLogItem[];

  /** Render newest events first. */
  newestFirst?: boolean;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders structured TUI events as safe log rows. */
export function renderEventLog({
  height,
  items,
  newestFirst = false,
  width,
}: RenderEventLogOptions): string {
  const ordered = newestFirst ? [...items].reverse() : [...items];
  const lines = ordered.map((item) => {
    const time = item.time === undefined ? '' : `${item.time} `;
    const scope = item.scope === undefined ? '' : `[${item.scope}] `;

    return `${time}${(item.level ?? 'info').toUpperCase()} ${scope}${item.message}`;
  });

  return renderPlainLines(lines, { height, width });
}
