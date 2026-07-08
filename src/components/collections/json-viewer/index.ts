import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderJsonViewer}. */
export interface JsonViewerCharacters {
  collapsed: string;
  expanded: string;
  leaf: string;
}

/** Options accepted by {@link renderJsonViewer}. */
export interface RenderJsonViewerOptions {
  characters?: JsonViewerCharacters;
  emptyText?: string;
  expandedPaths?: ReadonlySet<string>;
  height: number;
  indent?: number;
  offset?: number;
  rootLabel?: string;
  value: unknown;
  width: number;
}

interface JsonRow {
  depth: number;
  expandable: boolean;
  expanded: boolean;
  key: string;
  path: string;
  summary: string;
}

const DEFAULT_CHARACTERS: JsonViewerCharacters = {
  collapsed: '▸',
  expanded: '▾',
  leaf: ' ',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function valueSummary(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (typeof value === 'object') {
    return `Object(${Object.keys(value as Record<string, unknown>).length})`;
  }

  if (typeof value === 'string') {
    return JSON.stringify(plainText(value));
  }

  return String(value);
}

function childPath(parent: string, key: string, arrayIndex: boolean): string {
  return arrayIndex ? `${parent}[${key}]` : `${parent}.${key}`;
}

function flattenJson(
  value: unknown,
  expandedPaths: ReadonlySet<string>,
  rootLabel: string,
): readonly JsonRow[] {
  const rows: JsonRow[] = [];
  const seen = new WeakSet<object>();
  const visit = (key: string, currentValue: unknown, path: string, depth: number): void => {
    const expandable =
      currentValue !== null &&
      typeof currentValue === 'object' &&
      (Array.isArray(currentValue)
        ? currentValue.length > 0
        : Object.keys(currentValue as Record<string, unknown>).length > 0);
    const expanded = expandable && expandedPaths.has(path);

    rows.push({
      depth,
      expandable,
      expanded,
      key,
      path,
      summary:
        typeof currentValue === 'object' && currentValue !== null && seen.has(currentValue)
          ? '[Circular]'
          : valueSummary(currentValue),
    });

    if (!expandable || !expanded || currentValue === null || typeof currentValue !== 'object') {
      return;
    }

    if (seen.has(currentValue)) {
      return;
    }

    seen.add(currentValue);

    if (Array.isArray(currentValue)) {
      currentValue.forEach((item, index) => {
        visit(String(index), item, childPath(path, String(index), true), depth + 1);
      });

      return;
    }

    for (const [childKey, childValue] of Object.entries(currentValue)) {
      visit(childKey, childValue, childPath(path, childKey, false), depth + 1);
    }
  };

  visit(rootLabel, value, '$', 0);

  return rows;
}

/** Renders expandable JSON/object data as bounded plain terminal rows. */
export function renderJsonViewer({
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No data',
  expandedPaths = new Set(['$']),
  height,
  indent = 2,
  offset = 0,
  rootLabel = '$',
  value,
  width,
}: RenderJsonViewerOptions): string {
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
    throw new RangeError(
      'JsonViewer dimensions, offset, and indent must be non-negative integers.',
    );
  }

  if (height === 0 || width === 0) {
    return '';
  }

  if (value === undefined) {
    return truncateText(plainText(emptyText), width);
  }

  return flattenJson(value, expandedPaths, plainText(rootLabel))
    .slice(offset, offset + height)
    .map(({ depth, expandable, expanded, key, summary }) => {
      const toggle = expandable
        ? expanded
          ? characters.expanded
          : characters.collapsed
        : characters.leaf;
      const separator = expandable ? ' ' : ': ';

      return truncateText(
        `${' '.repeat(depth * indent)}${toggle} ${plainText(key)}${separator}${summary}`,
        width,
      );
    })
    .join('\n');
}
