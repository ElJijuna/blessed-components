import blessed from 'blessed';
import {
  type CommandInputStatus,
  type CommandInputSuggestion,
  filterCommandInputSuggestions,
  renderCommandInput,
} from '@/components/input/command-input/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import type { BlessedComponentHandle } from './types.js';
export type CommandInputBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export interface CommandInputData<
  TSuggestion extends CommandInputSuggestion = CommandInputSuggestion,
> {
  defaultValue?: string;
  history?: readonly string[];
  onCancel?: () => void;
  onSubmit?: (value: string) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  prompt?: string;
  status?: CommandInputStatus;
  statusText?: string;
  suggestions?: readonly TSuggestion[];
  value?: string;
}
export interface CommandInputOptions<
  TSuggestion extends CommandInputSuggestion = CommandInputSuggestion,
> {
  box?: CommandInputBoxOptions;
  data?: CommandInputData<TSuggestion>;
  parent: blessed.Widgets.Node;
}
export interface CommandInputHandle<
  TSuggestion extends CommandInputSuggestion = CommandInputSuggestion,
> extends BlessedComponentHandle<CommandInputData<TSuggestion>, blessed.Widgets.BoxElement> {
  activeSuggestionId(): string | undefined;
  cancel(): void;
  clear(): boolean;
  focus(): void;
  historyNext(): string;
  historyPrevious(): string;
  nextSuggestion(): string | undefined;
  previousSuggestion(): string | undefined;
  setValue(value: string): boolean;
  submit(): boolean;
  useActiveSuggestion(): string | undefined;
  value(): string;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function printable(value: string | undefined): value is string {
  return value !== undefined && value.length === 1 && value >= ' ' && value !== '\u007f';
}

/** Creates an interactive CommandInput backed by a Blessed box. */
export function commandInput<TSuggestion extends CommandInputSuggestion>({
  box,
  data: initialData = {},
  parent,
}: CommandInputOptions<TSuggestion>): CommandInputHandle<TSuggestion> {
  let data = initialData;
  let uncontrolledValue = data.defaultValue ?? '';
  let historyIndex = data.history?.length ?? 0;
  let active: string | undefined;
  let scope = createFocusScope({ items: data.suggestions ?? [] });

  const element = blessed.box({
    height: 5,
    keys: true,
    mouse: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const controlled = () => Object.hasOwn(data, 'value');
  const current = () => (controlled() ? (data.value ?? '') : uncontrolledValue);
  const matches = () => filterCommandInputSuggestions(data.suggestions ?? [], current());
  const rebuild = () => {
    scope = createFocusScope({ items: matches() });
    scope.activate();
    active = scope.current();
  };
  const render = () =>
    element.setContent(
      renderCommandInput({
        ...(active === undefined ? {} : { activeSuggestionId: active }),
        height: Math.max(0, dimension(element.height) - dimension(element.iheight)),
        ...(data.placeholder === undefined ? {} : { placeholder: data.placeholder }),
        ...(data.prompt === undefined ? {} : { prompt: data.prompt }),
        ...(data.status === undefined ? {} : { status: data.status }),
        ...(data.statusText === undefined ? {} : { statusText: data.statusText }),
        suggestions: data.suggestions ?? [],
        value: current(),
        width: Math.max(0, dimension(element.width) - dimension(element.iwidth)),
      }),
    );
  const commit = (value: string) => {
    if (!controlled()) {
      uncontrolledValue = value;
    }

    data.onValueChange?.(value);
    rebuild();
    render();

    return true;
  };
  const move = (id: string | undefined) => {
    active = id;
    render();

    return active;
  };
  const historyValue = (direction: number) => {
    const history = data.history ?? [];

    historyIndex = Math.max(0, Math.min(history.length, historyIndex + direction));
    const value = historyIndex === history.length ? '' : (history[historyIndex] ?? '');

    commit(value);

    return current();
  };

  rebuild();
  render();
  const handle: CommandInputHandle<TSuggestion> = {
    activeSuggestionId: () => active,
    cancel() {
      data.onCancel?.();
    },
    clear: () => commit(''),
    destroy: () => element.destroy(),
    element,
    focus: () => element.focus(),
    historyNext: () => historyValue(1),
    historyPrevious: () => historyValue(-1),
    nextSuggestion: () => move(scope.next()),
    previousSuggestion: () => move(scope.previous()),
    setData(nextData) {
      data = nextData;
      historyIndex = data.history?.length ?? 0;

      if (!controlled() && nextData.defaultValue !== undefined) {
        uncontrolledValue = nextData.defaultValue;
      }

      rebuild();
      render();
    },
    setValue: commit,
    submit() {
      const value = current().trim();

      if (value.length === 0 || data.status === 'running') {
        return false;
      }

      data.onSubmit?.(value);

      return true;
    },
    useActiveSuggestion() {
      const suggestion = (data.suggestions ?? []).find(
        ({ disabled, id }) => id === active && disabled !== true,
      );

      if (suggestion === undefined) {
        return undefined;
      }

      commit(suggestion.value);

      return suggestion.value;
    },
    value: current,
  };

  element.on('keypress', (character: string, key: { full?: string; name?: string }) => {
    switch (key.full ?? key.name) {
      case 'up':
        handle.historyPrevious();
        break;
      case 'down':
        handle.historyNext();
        break;
      case 'tab':
        handle.nextSuggestion();
        break;
      case 'shift-tab':
        handle.previousSuggestion();
        break;
      case 'enter':
        if (active !== undefined && matches().some(({ id }) => id === active)) {
          handle.useActiveSuggestion();
        } else {
          handle.submit();
        }

        break;
      case 'escape':
        handle.cancel();
        break;
      case 'backspace':
        commit(current().slice(0, -1));
        break;
      case 'C-u':
        commit('');
        break;

      default:
        if (printable(character)) {
          commit(`${current()}${character}`);
        }
    }
  });
  element.on('resize', render);

  return handle;
}
