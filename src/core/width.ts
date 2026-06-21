import { stripBlessedTags } from './tags.js';

/* eslint-disable no-control-regex -- ANSI parsing requires ESC and BEL. */
// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI parsing requires ESC and BEL.
const ANSI_PATTERN = /\u001B(?:[@-_][0-?]*[ -/]*[@-~]|\][^\u0007]*(?:\u0007|\u001B\\))/g;
/* eslint-enable no-control-regex */
const COMBINING_MARK_PATTERN = /^\p{Mark}+$/u;
const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;

function isWideCodePoint(codePoint: number): boolean {
  return (
    codePoint >= 0x1100 &&
    (codePoint <= 0x115f ||
      codePoint === 0x2329 ||
      codePoint === 0x232a ||
      (codePoint >= 0x2e80 && codePoint <= 0xa4cf && codePoint !== 0x303f) ||
      (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
      (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
      (codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
      (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
      (codePoint >= 0xff00 && codePoint <= 0xff60) ||
      (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
      (codePoint >= 0x1b000 && codePoint <= 0x1b2ff) ||
      (codePoint >= 0x1f200 && codePoint <= 0x1f251) ||
      (codePoint >= 0x20000 && codePoint <= 0x3fffd))
  );
}

function graphemeWidth(grapheme: string): number {
  if (grapheme === '' || COMBINING_MARK_PATTERN.test(grapheme)) {
    return 0;
  }

  const codePoint = grapheme.codePointAt(0);

  if (codePoint === undefined || codePoint === 0 || codePoint < 0x20 || codePoint === 0x7f) {
    return 0;
  }

  return EMOJI_PATTERN.test(grapheme) || isWideCodePoint(codePoint) ? 2 : 1;
}

/**
 * Removes ANSI control sequences.
 */
export function stripAnsi(value: string): string {
  return value.replace(ANSI_PATTERN, '');
}

/**
 * Returns terminal cell width after removing ANSI sequences and Blessed tags.
 */
export function visibleWidth(value: string): number {
  const plainText = stripAnsi(stripBlessedTags(value));
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

  return Array.from(segmenter.segment(plainText), ({ segment }) => graphemeWidth(segment)).reduce(
    (total, width) => total + width,
    0,
  );
}

/**
 * Slices plain visible text to at most `width` terminal cells.
 *
 * ANSI sequences and Blessed tags are removed from the returned value.
 */
export function sliceByWidth(value: string, width: number, start = 0): string {
  if (!Number.isInteger(width) || width < 0 || !Number.isInteger(start) || start < 0) {
    throw new RangeError('Terminal slice widths must be non-negative integers.');
  }

  const plainText = stripAnsi(stripBlessedTags(value));
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

  let cursor = 0;
  let result = '';

  for (const { segment } of segmenter.segment(plainText)) {
    const segmentWidth = graphemeWidth(segment);
    const nextCursor = cursor + segmentWidth;

    if (nextCursor <= start) {
      cursor = nextCursor;
      continue;
    }

    if (cursor < start || nextCursor > start + width) {
      cursor = nextCursor;
      continue;
    }

    result += segment;
    cursor = nextCursor;
  }

  return result;
}
