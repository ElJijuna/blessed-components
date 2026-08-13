import { plain } from '@/components/shared/text.js';
import { truncateText } from '@/core/truncate.js';
import { visibleWidth } from '@/core/width.js';

/** Semantic transient state displayed by FooterBar. */
export type FooterBarTone = 'danger' | 'info' | 'success' | 'warning';

/** One keyboard hint displayed by FooterBar. */
export interface FooterBarShortcut {
  /** Visible key or chord. */
  key: string;
  /** Human-readable action label. */
  label: string;
}

/** Character tokens used by {@link renderFooterBar}. */
export interface FooterBarCharacters {
  danger: string;
  hintSeparator: string;
  info: string;
  keyLeft: string;
  keyRight: string;
  sectionSeparator: string;
  success: string;
  warning: string;
}

export const FOOTER_BAR_UNICODE_CHARACTERS: Readonly<FooterBarCharacters> = Object.freeze({
  danger: '×',
  hintSeparator: '  ',
  info: 'i',
  keyLeft: '[',
  keyRight: ']',
  sectionSeparator: ' │ ',
  success: '✓',
  warning: '!',
});

export const FOOTER_BAR_ASCII_CHARACTERS: Readonly<FooterBarCharacters> = Object.freeze({
  danger: 'x',
  hintSeparator: '  ',
  info: 'i',
  keyLeft: '[',
  keyRight: ']',
  sectionSeparator: ' | ',
  success: 'ok',
  warning: '!',
});

/** Options accepted by {@link renderFooterBar}. */
export interface RenderFooterBarOptions {
  characters?: FooterBarCharacters;
  /** Persistent application context shown before the message. */
  context?: string;
  /** Current or transient application message. */
  message?: string;
  /** Whether output is padded to exactly `width`. @defaultValue `true` */
  pad?: boolean;
  shortcuts?: readonly FooterBarShortcut[];
  /** Semantic marker for `message`. */
  tone?: FooterBarTone;
  width: number;
}

/** Rendered footer plus shortcuts visible after responsive layout. */
export interface FooterBarRenderResult {
  content: string;
  visibleShortcutIndexes: readonly number[];
}

function oneLine(value: string): string {
  return plain(value)
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

function token(value: string): string {
  return plain(value).replace(/[\r\n]+/gu, ' ');
}

function marker(tone: FooterBarTone, characters: FooterBarCharacters): string {
  return oneLine(characters[tone]);
}

/** Lays out application context, transient state, and shortcut hints on one line. */
export function renderFooterBarModel({
  characters = FOOTER_BAR_UNICODE_CHARACTERS,
  context,
  message,
  pad = true,
  shortcuts = [],
  tone,
  width,
}: RenderFooterBarOptions): FooterBarRenderResult {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('FooterBar width must be a non-negative integer.');
  }

  const safeContext = context === undefined ? '' : oneLine(context);
  const safeMessage = message === undefined ? '' : oneLine(message);
  const markedMessage =
    safeMessage.length === 0 || tone === undefined
      ? safeMessage
      : `${marker(tone, characters)} ${safeMessage}`;
  const left = [safeContext, markedMessage]
    .filter(Boolean)
    .join(token(characters.sectionSeparator));
  const renderedHints = shortcuts.map(({ key, label }) => {
    const safeKey = oneLine(key);
    const safeLabel = oneLine(label);

    if (safeKey.length === 0 || safeLabel.length === 0) {
      throw new RangeError('FooterBar shortcut keys and labels must be non-empty.');
    }

    return `${token(characters.keyLeft)}${safeKey}${token(characters.keyRight)} ${safeLabel}`;
  });
  const separator = token(characters.hintSeparator) || ' ';
  const sectionSeparator = token(characters.sectionSeparator) || ' ';

  let right = '';

  const visible: number[] = [];

  for (const [index, hint] of renderedHints.entries()) {
    const candidate = right.length === 0 ? hint : `${right}${separator}${hint}`;
    const required =
      visibleWidth(candidate) + (left.length === 0 ? 0 : visibleWidth(sectionSeparator) + 1);

    if (required > width) {
      break;
    }

    right = candidate;
    visible.push(index);
  }

  let content: string;

  if (right.length === 0) {
    content = truncateText(left, width);
  } else {
    const leftBudget = Math.max(0, width - visibleWidth(right) - 1);
    const fittedLeft = truncateText(left, leftBudget);

    content = `${fittedLeft}${' '.repeat(Math.max(1, width - visibleWidth(fittedLeft) - visibleWidth(right)))}${right}`;
  }

  content = truncateText(content, width);

  if (pad) {
    content += ' '.repeat(Math.max(0, width - visibleWidth(content)));
  }

  return { content, visibleShortcutIndexes: visible };
}

/** Renders a persistent application footer with messages and keyboard hints. */
export function renderFooterBar(options: RenderFooterBarOptions): string {
  return renderFooterBarModel(options).content;
}
