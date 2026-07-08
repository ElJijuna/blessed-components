import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

export interface RenderLinkOptions {
  label: string;
  showUrl?: boolean;
  terminalHyperlink?: boolean;
  url: string;
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).trim();
}

/** Renders a visible URL, optionally wrapped in an OSC 8 terminal hyperlink. */
export function renderLink({
  label,
  showUrl = true,
  terminalHyperlink = false,
  url,
  width,
}: RenderLinkOptions): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Link width must be a non-negative integer.');
  }

  if (width === 0) {
    return '';
  }

  const safeLabel = plainText(label);
  const safeUrl = plainText(url);

  if (safeLabel.length === 0 || safeUrl.length === 0 || /[\r\n]/u.test(safeUrl)) {
    throw new RangeError('Link label and URL must be non-empty one-line strings.');
  }

  const content = showUrl ? `${safeLabel} <${safeUrl}>` : safeLabel;
  const truncated = truncateText(content, width);

  return terminalHyperlink ? `\u001B]8;;${safeUrl}\u0007${truncated}\u001B]8;;\u0007` : truncated;
}
