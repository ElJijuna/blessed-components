import { renderPlainLines } from '@/components/shared/text.js';

/** Header tuple. */
export interface RequestInspectorHeader {
  name: string;
  value: string;
}

/** Options accepted by {@link renderRequestInspector}. */
export interface RenderRequestInspectorOptions {
  /** Optional body preview. */
  body?: string;

  /** Maximum rendered height. */
  height?: number;

  /** HTTP method. */
  method: string;

  /** Request or response headers. */
  headers?: readonly RequestInspectorHeader[];

  /** Status code for response view. */
  status?: number;

  /** URL or path. */
  url: string;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders HTTP request/response metadata and body preview. */
export function renderRequestInspector({
  body,
  headers = [],
  height,
  method,
  status,
  url,
  width,
}: RenderRequestInspectorOptions): string {
  const lines = [
    `${method.toUpperCase()} ${url}${status === undefined ? '' : ` -> ${status}`}`,
    ...headers.map((header) => `${header.name}: ${header.value}`),
    ...(body === undefined ? [] : ['', body]),
  ];

  return renderPlainLines(lines, { height, width });
}
