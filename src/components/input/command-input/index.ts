import { fitPlain, plain } from '@/components/shared/text.js';

/** CommandInput execution state. */
export type CommandInputStatus = 'error' | 'idle' | 'running' | 'success';
/** One completion suggestion. */
export interface CommandInputSuggestion {
  description?: string;
  disabled?: boolean;
  id: string;
  value: string;
}
/** Renderer options. */
export interface RenderCommandInputOptions<
  TSuggestion extends CommandInputSuggestion = CommandInputSuggestion,
> {
  activeSuggestionId?: string;
  cursor?: number;
  height?: number;
  placeholder?: string;
  prompt?: string;
  status?: CommandInputStatus;
  statusText?: string;
  suggestions?: readonly TSuggestion[];
  value?: string;
  width?: number;
}
/** Render result plus suggestion ids visible after clipping. */
export interface CommandInputRenderResult {
  content: string;
  visibleSuggestionIds: readonly string[];
}

function oneLine(value: string): string {
  return plain(value).replace(/[\r\n]+/gu, ' ');
}

/** Filters suggestions by current command text. */
export function filterCommandInputSuggestions<TSuggestion extends CommandInputSuggestion>(
  suggestions: readonly TSuggestion[],
  value = '',
): readonly TSuggestion[] {
  const query = oneLine(value).trim().toLowerCase();

  if (query.length === 0) {
    return [...suggestions];
  }

  return suggestions.filter((item) =>
    [item.value, item.description]
      .filter((entry): entry is string => entry !== undefined)
      .some((entry) => oneLine(entry).toLowerCase().includes(query)),
  );
}

/** Renders prompt-style command entry with status and suggestions. */
export function renderCommandInputModel<TSuggestion extends CommandInputSuggestion>({
  activeSuggestionId,
  cursor,
  height,
  placeholder = 'Type a command',
  prompt = '>',
  status = 'idle',
  statusText,
  suggestions = [],
  value = '',
  width,
}: RenderCommandInputOptions<TSuggestion>): CommandInputRenderResult {
  if (
    (height !== undefined && (!Number.isInteger(height) || height < 0)) ||
    (width !== undefined && (!Number.isInteger(width) || width < 0))
  ) {
    throw new RangeError('CommandInput dimensions must be non-negative integers.');
  }

  const safePrompt = oneLine(prompt).trim();

  if (safePrompt.length === 0) {
    throw new RangeError('CommandInput prompt must be non-empty.');
  }

  const safeValue = oneLine(value);
  const resolvedCursor = cursor ?? safeValue.length;

  if (
    !Number.isInteger(resolvedCursor) ||
    resolvedCursor < 0 ||
    resolvedCursor > safeValue.length
  ) {
    throw new RangeError('CommandInput cursor must be within the value.');
  }

  const before = safeValue.slice(0, resolvedCursor);
  const after = safeValue.slice(resolvedCursor);
  const display = safeValue.length === 0 ? oneLine(placeholder) : `${before}│${after}`;
  const state =
    status === 'idle'
      ? ''
      : ` [${status.toUpperCase()}${statusText === undefined ? '' : `: ${oneLine(statusText)}`}]`;
  const lines: { id?: string; text: string }[] = [{ text: `${safePrompt} ${display}${state}` }];
  const matches = filterCommandInputSuggestions(suggestions, safeValue);

  for (const item of matches) {
    if (oneLine(item.id).trim().length === 0 || oneLine(item.value).trim().length === 0) {
      throw new RangeError('CommandInput suggestion ids and values must be non-empty.');
    }

    const marker = item.disabled ? '×' : item.id === activeSuggestionId ? '›' : ' ';
    const description = item.description === undefined ? '' : ` - ${oneLine(item.description)}`;

    lines.push({ id: item.id, text: `${marker} ${oneLine(item.value)}${description}` });
  }

  const visible = height === undefined ? lines : lines.slice(0, height);

  return {
    content: visible.map(({ text }) => fitPlain(text, width)).join('\n'),
    visibleSuggestionIds: visible.flatMap(({ id }) => (id === undefined ? [] : [id])),
  };
}

export function renderCommandInput<TSuggestion extends CommandInputSuggestion>(
  options: RenderCommandInputOptions<TSuggestion>,
): string {
  return renderCommandInputModel(options).content;
}
