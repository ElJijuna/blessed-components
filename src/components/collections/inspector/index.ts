import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Inspector row containing key, type, and preview value metadata. */
export interface InspectorRow {
  depth: number;
  key: string;
  path: string;
  type: string;
  value: string;
}

/** Options accepted by {@link renderInspector}. */
export interface RenderInspectorOptions {
  emptyText?: string;
  expandedPaths?: ReadonlySet<string>;
  height: number;
  indent?: number;
  offset?: number;
  rootLabel?: string;
  value: unknown;
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function typeName(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
}

function displayValue(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(plainText(value));
  }

  if (value === null || typeof value !== 'object') {
    return String(value);
  }

  return Array.isArray(value)
    ? `${value.length} item${value.length === 1 ? '' : 's'}`
    : `${Object.keys(value as Record<string, unknown>).length} field${
        Object.keys(value as Record<string, unknown>).length === 1 ? '' : 's'
      }`;
}

function inspectValue(
  value: unknown,
  expandedPaths: ReadonlySet<string>,
  rootLabel: string,
): readonly InspectorRow[] {
  const rows: InspectorRow[] = [];
  const seen = new WeakSet<object>();
  const visit = (key: string, currentValue: unknown, path: string, depth: number): void => {
    const currentType = typeName(currentValue);

    rows.push({
      depth,
      key,
      path,
      type: currentType,
      value:
        typeof currentValue === 'object' && currentValue !== null && seen.has(currentValue)
          ? '[Circular]'
          : displayValue(currentValue),
    });

    if (
      currentValue === null ||
      typeof currentValue !== 'object' ||
      !expandedPaths.has(path) ||
      seen.has(currentValue)
    ) {
      return;
    }

    seen.add(currentValue);

    if (Array.isArray(currentValue)) {
      currentValue.forEach((item, index) => {
        visit(String(index), item, `${path}[${index}]`, depth + 1);
      });

      return;
    }

    for (const [childKey, childValue] of Object.entries(currentValue)) {
      visit(childKey, childValue, `${path}.${childKey}`, depth + 1);
    }
  };

  visit(rootLabel, value, '$', 0);

  return rows;
}

/** Renders object inspection rows with key, type, and preview value. */
export function renderInspector({
  emptyText = 'No value',
  expandedPaths = new Set(['$']),
  height,
  indent = 2,
  offset = 0,
  rootLabel = '$',
  value,
  width,
}: RenderInspectorOptions): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    !Number.isInteger(indent) ||
    indent < 0
  ) {
    throw new RangeError('Inspector dimensions, offset, and indent must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  if (value === undefined) {
    return truncateText(plainText(emptyText), width);
  }

  return inspectValue(value, expandedPaths, plainText(rootLabel))
    .slice(offset, offset + height)
    .map(({ depth, key, type, value: rowValue }) =>
      truncateText(`${' '.repeat(depth * indent)}${plainText(key)} <${type}> ${rowValue}`, width),
    )
    .join('\n');
}
