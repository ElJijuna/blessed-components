import { renderPlainLines } from '@/components/shared/text.js';

/** Shell history command. */
export interface ShellHistoryItem {
  command: string;
  id: string;
}

/** Options accepted by {@link renderShellHistory}. */
export interface RenderShellHistoryOptions {
  activeId?: string;
  height?: number;
  items: readonly ShellHistoryItem[];
  query?: string;
  width?: number;
}

/** Renders searchable shell command history. */
export function renderShellHistory({
  activeId,
  height,
  items,
  query = '',
  width,
}: RenderShellHistoryOptions): string {
  const normalized = query.toLowerCase();
  const visible =
    normalized.length === 0
      ? items
      : items.filter((item) => item.command.toLowerCase().includes(normalized));

  return renderPlainLines(
    [
      `query: ${query}`,
      ...visible.map((item) => `${item.id === activeId ? '>' : ' '} ${item.command}`),
    ],
    { height, width },
  );
}
