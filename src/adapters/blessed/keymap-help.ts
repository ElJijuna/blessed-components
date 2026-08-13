import blessed from 'blessed';
import {
  KEYMAP_HELP_ASCII_CHARACTERS,
  KEYMAP_HELP_UNICODE_CHARACTERS,
  type KeymapHelpCommand,
  renderKeymapHelp,
} from '@/components/navigation/keymap-help/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { BlessedComponentHandle } from './types.js';

export type KeymapHelpBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;
export interface KeymapHelpData<TCommand extends KeymapHelpCommand = KeymapHelpCommand> {
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;
  commands: readonly TCommand[];
  onQueryChange?: (query: string) => void;
  query?: string;
  scope?: string;
}
export interface KeymapHelpOptions<TCommand extends KeymapHelpCommand = KeymapHelpCommand> {
  box?: KeymapHelpBoxOptions;
  data: KeymapHelpData<TCommand>;
  parent: blessed.Widgets.Node;
}
export interface KeymapHelpHandle<TCommand extends KeymapHelpCommand = KeymapHelpCommand>
  extends BlessedComponentHandle<KeymapHelpData<TCommand>, blessed.Widgets.BoxElement> {
  clearQuery(): string;
  focus(): void;
  query(): string;
  setQuery(query: string): string;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function printable(value: string | undefined): value is string {
  return value !== undefined && value.length === 1 && value >= ' ' && value !== '\u007f';
}

/** Creates a searchable KeymapHelp backed by a Blessed box. */
export function keymapHelp<TCommand extends KeymapHelpCommand>({
  box,
  data: initialData,
  parent,
}: KeymapHelpOptions<TCommand>): KeymapHelpHandle<TCommand> {
  let data = initialData;
  let uncontrolledQuery = data.query ?? '';

  const element = blessed.box({
    keys: true,
    mouse: true,
    scrollable: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const controlled = () => Object.hasOwn(data, 'query');
  const current = () => (controlled() ? (data.query ?? '') : uncontrolledQuery);
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();

    element.setContent(
      renderKeymapHelp({
        characters: capabilities.unicode
          ? KEYMAP_HELP_UNICODE_CHARACTERS
          : KEYMAP_HELP_ASCII_CHARACTERS,
        commands: data.commands,
        height: Math.max(0, dimension(element.height) - dimension(element.iheight)),
        query: current(),
        ...(data.scope === undefined ? {} : { scope: data.scope }),
        width: Math.max(0, dimension(element.width) - dimension(element.iwidth)),
      }),
    );
  };
  const setQuery = (query: string) => {
    if (!controlled()) {
      uncontrolledQuery = query;
    }

    data.onQueryChange?.(query);
    render();

    return current();
  };

  render();
  const handle: KeymapHelpHandle<TCommand> = {
    clearQuery: () => setQuery(''),
    destroy: () => element.destroy(),
    element,
    focus: () => element.focus(),
    query: current,
    setData(nextData) {
      const previous = current();

      data = nextData;

      if (!controlled()) {
        uncontrolledQuery = nextData.query ?? previous;
      }

      render();
    },
    setQuery,
  };

  element.on('keypress', (character: string, key: { full?: string; name?: string }) => {
    switch (key.full ?? key.name) {
      case 'backspace':
        setQuery(current().slice(0, -1));
        break;
      case 'C-u':
        setQuery('');
        break;

      default:
        if (printable(character)) {
          setQuery(`${current()}${character}`);
        }
    }
  });
  element.on('resize', render);

  return handle;
}
