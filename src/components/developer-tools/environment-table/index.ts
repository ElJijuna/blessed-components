import { pad, plain, renderPlainLines } from '@/components/shared/text.js';

/** Environment variable row. */
export interface EnvironmentTableItem {
  /** Variable name. */
  name: string;

  /** Whether value should be masked. */
  secret?: boolean;

  /** Variable value. */
  value?: string;
}

/** Options accepted by {@link renderEnvironmentTable}. */
export interface RenderEnvironmentTableOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Variables to render. */
  items: readonly EnvironmentTableItem[];

  /** Text used for masked values. */
  mask?: string;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders environment variables with deterministic masking for secrets. */
export function renderEnvironmentTable({
  height,
  items,
  mask = '********',
  width,
}: RenderEnvironmentTableOptions): string {
  const nameWidth = Math.max(3, ...items.map((item) => plain(item.name).length));
  const lines = [
    `${pad('KEY', nameWidth)} VALUE`,
    ...items.map((item) => {
      const value = item.secret ? mask : (item.value ?? '');

      return `${pad(item.name, nameWidth)} ${value}`;
    }),
  ];

  return renderPlainLines(lines, { height, width });
}
