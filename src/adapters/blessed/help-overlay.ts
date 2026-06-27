import blessed from 'blessed';

import {
  type HelpOverlayCharacters,
  type HelpOverlaySection,
  renderHelpOverlay,
} from '@/components/navigation/help-overlay/index.js';
import {
  type CreateDialogStateOptions,
  createDialogState,
} from '@/components/overlays/dialog/index.js';
import type { KeymapHelpItem } from '@/core/keymap.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the HelpOverlay adapter. */
export type HelpOverlayBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'hidden' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link helpOverlay} adapter. */
export interface HelpOverlayData<TItem extends KeymapHelpItem = KeymapHelpItem>
  extends CreateDialogStateOptions {
  /** Character tokens used by the pure renderer. */
  characters?: HelpOverlayCharacters;

  /** Whether Escape requests closing. @defaultValue `true` */
  dismissOnEscape?: boolean;

  /** Text displayed when no shortcuts are provided. */
  emptyText?: string;

  /** Text displayed when filtering has no matches. */
  noResultsText?: string;

  /** Called after typing changes the search query. */
  onQueryChange?: (query: string) => void;

  /** Controlled search query. */
  query?: string;

  /** Ordered shortcut sections. */
  sections: readonly HelpOverlaySection<TItem>[];

  /** Visible title. */
  title?: string;
}

/** Options accepted by the Blessed {@link helpOverlay} adapter. */
export interface HelpOverlayOptions<TItem extends KeymapHelpItem = KeymapHelpItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: HelpOverlayBoxOptions;

  /** Open state, query state, and shortcut data. */
  data: HelpOverlayData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link helpOverlay}. */
export interface HelpOverlayHandle<TItem extends KeymapHelpItem = KeymapHelpItem>
  extends BlessedComponentHandle<HelpOverlayData<TItem>, blessed.Widgets.BoxElement> {
  /** Requests closing. */
  close(): boolean;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Current controlled or uncontrolled open state. */
  isOpen(): boolean;

  /** Requests opening. */
  open(): boolean;

  /** Current controlled or uncontrolled search query. */
  query(): string;

  /** Replaces the search query. */
  setQuery(query: string): string;

  /** Requests opposite open state. */
  toggle(): boolean;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function printableCharacter(character: string | undefined): character is string {
  return (
    character !== undefined && character.length === 1 && character >= ' ' && character !== '\u007f'
  );
}

/** Creates a searchable shortcut HelpOverlay backed by a Blessed box. */
export function helpOverlay<TItem extends KeymapHelpItem>({
  box,
  data: initialData,
  parent,
}: HelpOverlayOptions<TItem>): HelpOverlayHandle<TItem> {
  let data = initialData;
  let uncontrolledQuery = initialData.query ?? '';

  const state = createDialogState(initialData);
  const element = blessed.box({
    border: 'line',
    keys: true,
    padding: { left: 1, right: 1 },
    ...box,
    content: '',
    hidden: !state.isOpen(),
    parent,
    tags: false,
  });
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const isQueryControlled = (): boolean => Object.hasOwn(data, 'query');
  const currentQuery = (): string => (isQueryControlled() ? (data.query ?? '') : uncontrolledQuery);
  const render = (): void => {
    const dimensions = viewportSize();

    element.hidden = !state.isOpen();
    element.setContent(
      renderHelpOverlay({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: dimensions.height,
        ...(data.noResultsText === undefined ? {} : { noResultsText: data.noResultsText }),
        query: currentQuery(),
        sections: data.sections,
        ...(data.title === undefined ? {} : { title: data.title }),
        width: dimensions.width,
      }),
    );
  };
  const requestOpen = (nextOpen: boolean): boolean => {
    const open = nextOpen ? state.open() : state.close();

    element.hidden = !open;

    if (open) {
      element.focus();
    }

    render();

    return open;
  };
  const setQueryValue = (nextQuery: string): string => {
    if (!isQueryControlled()) {
      uncontrolledQuery = nextQuery;
    }

    data.onQueryChange?.(nextQuery);
    render();

    return currentQuery();
  };

  render();
  element.on('resize', render);
  element.on('keypress', (character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'backspace':
        setQueryValue(currentQuery().slice(0, -1));
        break;
      case 'escape':
        if (data.dismissOnEscape !== false) {
          requestOpen(false);
        }

        break;
      case 'C-u':
        setQueryValue('');

        break;
      default:
        if (printableCharacter(character)) {
          setQueryValue(`${currentQuery()}${character}`);
        }

        break;
    }
  });

  return {
    close: () => requestOpen(false),
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      element.focus();
    },
    isOpen: () => state.isOpen(),
    open: () => requestOpen(true),
    query: currentQuery,
    setData(nextData) {
      const previousQuery = currentQuery();

      data = nextData;
      state.setOptions(nextData);

      if (!isQueryControlled()) {
        uncontrolledQuery = nextData.query ?? previousQuery;
      }

      render();
    },
    setQuery: setQueryValue,
    toggle: () => requestOpen(!state.isOpen()),
  };
}
