import { fitPlain, plain } from '@/components/shared/text.js';
import { visibleWidth } from '@/core/width.js';

/** One command displayed by KeymapHelp. */
export interface KeymapHelpCommand {
  description: string;
  disabled?: boolean;
  disabledReason?: string;
  id: string;
  keys: readonly string[];
  /** Scope in which the command is active. */
  scope: string;
}

/** Character tokens used by {@link renderKeymapHelp}. */
export interface KeymapHelpCharacters {
  conflict: string;
  disabled: string;
  scope: string;
}
export const KEYMAP_HELP_UNICODE_CHARACTERS: Readonly<KeymapHelpCharacters> = Object.freeze({
  conflict: '⚠',
  disabled: '×',
  scope: '■',
});
export const KEYMAP_HELP_ASCII_CHARACTERS: Readonly<KeymapHelpCharacters> = Object.freeze({
  conflict: '!',
  disabled: 'x',
  scope: '#',
});

/** Options accepted by {@link renderKeymapHelp}. */
export interface RenderKeymapHelpOptions<TCommand extends KeymapHelpCommand = KeymapHelpCommand> {
  characters?: KeymapHelpCharacters;
  commands: readonly TCommand[];
  height?: number;
  query?: string;
  scope?: string;
  width?: number;
}

/** Result including ids visible after filtering and clipping. */
export interface KeymapHelpRenderResult {
  content: string;
  conflictingKeys: readonly string[];
  visibleCommandIds: readonly string[];
}

function oneLine(value: string, message: string): string {
  const result = plain(value)
    .replace(/[\r\n]+/gu, ' ')
    .trim();

  if (result.length === 0) {
    throw new RangeError(message);
  }

  return result;
}

/** Renders registered commands grouped by scope with conflicts and disabled state. */
export function renderKeymapHelpModel<TCommand extends KeymapHelpCommand>({
  characters = KEYMAP_HELP_UNICODE_CHARACTERS,
  commands,
  height,
  query = '',
  scope,
  width,
}: RenderKeymapHelpOptions<TCommand>): KeymapHelpRenderResult {
  if (
    (height !== undefined && (!Number.isInteger(height) || height < 0)) ||
    (width !== undefined && (!Number.isInteger(width) || width < 0))
  ) {
    throw new RangeError('KeymapHelp dimensions must be non-negative integers.');
  }

  const normalized = plain(query).trim().toLowerCase();
  const validated = commands.map((command) => {
    const id = oneLine(command.id, 'KeymapHelp command ids must be non-empty.');
    const description = oneLine(command.description, 'KeymapHelp descriptions must be non-empty.');
    const commandScope = oneLine(command.scope, 'KeymapHelp scopes must be non-empty.');
    const keys = command.keys.map((key) => oneLine(key, 'KeymapHelp keys must be non-empty.'));

    if (keys.length === 0) {
      throw new RangeError('KeymapHelp commands must include at least one key.');
    }

    return { ...command, description, id, keys, scope: commandScope };
  });
  const counts = new Map<string, number>();

  for (const command of validated) {
    for (const key of command.keys) {
      const token = `${command.scope}\0${key.toLowerCase()}`;

      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  const conflicts = [
    ...new Set(
      validated.flatMap((command) =>
        command.keys.filter(
          (key) => (counts.get(`${command.scope}\0${key.toLowerCase()}`) ?? 0) > 1,
        ),
      ),
    ),
  ];
  const filtered = validated.filter(
    (command) =>
      (scope === undefined || command.scope === scope) &&
      (normalized.length === 0 ||
        [command.id, command.description, command.scope, ...command.keys]
          .join(' ')
          .toLowerCase()
          .includes(normalized)),
  );
  const lines: { id?: string; text: string }[] = [];

  for (const commandScope of [...new Set(filtered.map((command) => command.scope))]) {
    lines.push({ text: `${characters.scope} ${commandScope}` });

    for (const command of filtered.filter((item) => item.scope === commandScope)) {
      const hasConflict = command.keys.some(
        (key) => (counts.get(`${command.scope}\0${key.toLowerCase()}`) ?? 0) > 1,
      );
      const state = command.disabled
        ? `${characters.disabled} `
        : hasConflict
          ? `${characters.conflict} `
          : '  ';
      const reason =
        command.disabled && command.disabledReason ? ` (${plain(command.disabledReason)})` : '';
      const keys = command.keys.join(', ');
      const padding = ' '.repeat(Math.max(2, 18 - visibleWidth(keys)));

      lines.push({
        id: command.id,
        text: `${state}${keys}${padding}${command.description}${reason}`,
      });
    }
  }

  if (lines.length === 0) {
    lines.push({ text: '- No matching commands' });
  }

  const visible = height === undefined ? lines : lines.slice(0, height);

  return {
    content: visible.map(({ text }) => fitPlain(text, width)).join('\n'),
    conflictingKeys: conflicts,
    visibleCommandIds: visible.flatMap(({ id }) => (id === undefined ? [] : [id])),
  };
}

export function renderKeymapHelp<TCommand extends KeymapHelpCommand>(
  options: RenderKeymapHelpOptions<TCommand>,
): string {
  return renderKeymapHelpModel(options).content;
}
