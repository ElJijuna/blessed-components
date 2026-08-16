import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** One selectable search scope. */
export interface SearchBarScope {
  /** Stable scope identifier. */
  id: string;
  /** Human-readable scope label. */
  label: string;
}

/** Value emitted by a SearchBar submission. */
export interface SearchBarSubmission {
  /** Current query. */
  query: string;
  /** Current scope, when scopes are configured. */
  scope?: SearchBarScope;
}

/** Focusable SearchBar control. */
export type SearchBarTarget = 'clear' | 'query' | 'scope' | 'submit';

/** Character tokens used by {@link renderSearchBar}. */
export interface SearchBarCharacters {
  /** Marker placed before an active control. */
  activeLeft: string;
  /** Marker placed after an active control. */
  activeRight: string;
  /** Clear-query marker. */
  clear: string;
  /** Text shown when query and placeholder are empty. */
  empty: string;
  /** Search-query marker. */
  search: string;
  /** Separator between regions. */
  separator: string;
  /** Left scope delimiter. */
  scopeLeft: string;
  /** Right scope delimiter. */
  scopeRight: string;
  /** Submit control label. */
  submit: string;
}

export const SEARCH_BAR_UNICODE_CHARACTERS: Readonly<SearchBarCharacters> = Object.freeze({
  activeLeft: '▸',
  activeRight: '◂',
  clear: '×',
  empty: ' ',
  search: '/',
  separator: '│',
  scopeLeft: '[',
  scopeRight: ']',
  submit: 'Search',
});

export const SEARCH_BAR_ASCII_CHARACTERS: Readonly<SearchBarCharacters> = Object.freeze({
  activeLeft: '>',
  activeRight: '<',
  clear: 'x',
  empty: ' ',
  search: '/',
  separator: '|',
  scopeLeft: '[',
  scopeRight: ']',
  submit: 'Search',
});

/** Options accepted by {@link createSearchBarState}. */
export interface CreateSearchBarStateOptions {
  /** Initial query for uncontrolled usage. */
  defaultQuery?: string;
  /** Initial scope id for uncontrolled usage. Defaults to the first scope. */
  defaultScopeId?: string;
  /** Whether state-changing and submission requests are rejected. */
  disabled?: boolean;
  /** Called after an enabled clear request. */
  onClear?: () => void;
  /** Called when an enabled query change is requested. */
  onQueryChange?: (query: string) => void;
  /** Called when an enabled scope change is requested. */
  onScopeChange?: (scopeId: string) => void;
  /** Called when an enabled submission is requested. */
  onSubmit?: (submission: SearchBarSubmission) => void;
  /** Controlled query. */
  query?: string;
  /** Controlled scope id. */
  scopeId?: string;
  /** Ordered search scopes. */
  scopes?: readonly SearchBarScope[];
}

/** Framework-independent SearchBar state. */
export interface SearchBarStateModel {
  /** Current scope, when configured. */
  activeScope(): SearchBarScope | undefined;
  /** Clears the query when enabled. */
  clear(): boolean;
  /** Advances to the next scope. */
  nextScope(): SearchBarScope | undefined;
  /** Moves to the previous scope. */
  previousScope(): SearchBarScope | undefined;
  /** Current controlled or uncontrolled query. */
  query(): string;
  /** Replaces callbacks, controlled values, and scopes. */
  setOptions(options: CreateSearchBarStateOptions): void;
  /** Requests a query change and reports whether enabled. */
  setQuery(query: string): boolean;
  /** Requests a scope change and reports whether enabled. */
  setScope(scopeId: string): boolean;
  /** Submits the current query and scope when enabled. */
  submit(): boolean;
}

/** Options accepted by {@link renderSearchBar}. */
export interface RenderSearchBarOptions {
  /** Control currently selected for keyboard interaction. */
  activeTarget?: SearchBarTarget;
  /** Character tokens used by the renderer. */
  characters?: SearchBarCharacters;
  /** Whether interaction is unavailable. */
  disabled?: boolean;
  /** Whether output is padded to `width`. */
  pad?: boolean;
  /** Placeholder shown for an empty query. */
  placeholder?: string;
  /** Current query. */
  query?: string;
  /** Optional result metadata. */
  resultCount?: number;
  /** Current scope id. */
  scopeId?: string;
  /** Ordered search scopes. */
  scopes?: readonly SearchBarScope[];
  /** Whether a submit control is shown. @defaultValue `true` */
  showSubmit?: boolean;
  /** Available terminal-cell width. */
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).replace(/[\r\n]+/gu, ' ');
}

function assertScopes(scopes: readonly SearchBarScope[]): void {
  const ids = new Set<string>();

  for (const scope of scopes) {
    if (plainText(scope.id).trim().length === 0 || plainText(scope.label).trim().length === 0) {
      throw new RangeError('SearchBar scope ids and labels must be non-empty.');
    }

    if (ids.has(scope.id)) {
      throw new RangeError(`SearchBar scope ids must be unique: ${scope.id}.`);
    }

    ids.add(scope.id);
  }
}

function resolveInitialScope(options: CreateSearchBarStateOptions): string | undefined {
  const scopes = options.scopes ?? [];
  const selected = options.scopeId ?? options.defaultScopeId ?? scopes[0]?.id;

  if (selected !== undefined && !scopes.some(({ id }) => id === selected)) {
    throw new RangeError(`SearchBar scope does not exist: ${selected}.`);
  }

  return selected;
}

/** Creates controlled or uncontrolled SearchBar query and scope state. */
export function createSearchBarState(
  initialOptions: CreateSearchBarStateOptions = {},
): SearchBarStateModel {
  assertScopes(initialOptions.scopes ?? []);

  let options = initialOptions;
  let uncontrolledQuery = initialOptions.defaultQuery ?? '';
  let uncontrolledScopeId = resolveInitialScope(initialOptions);

  const isQueryControlled = (): boolean => Object.hasOwn(options, 'query');
  const isScopeControlled = (): boolean => Object.hasOwn(options, 'scopeId');
  const currentQuery = (): string =>
    isQueryControlled() ? (options.query ?? '') : uncontrolledQuery;
  const currentScopeId = (): string | undefined =>
    isScopeControlled() ? options.scopeId : uncontrolledScopeId;
  const activeScope = (): SearchBarScope | undefined =>
    (options.scopes ?? []).find(({ id }) => id === currentScopeId());
  const requestQuery = (query: string): boolean => {
    if (options.disabled === true) {
      return false;
    }

    if (/\r|\n/u.test(query)) {
      throw new RangeError('SearchBar query must fit on one line.');
    }

    if (!isQueryControlled()) {
      uncontrolledQuery = query;
    }

    options.onQueryChange?.(query);

    return true;
  };
  const requestScope = (scopeId: string): boolean => {
    if (options.disabled === true) {
      return false;
    }

    if (!(options.scopes ?? []).some(({ id }) => id === scopeId)) {
      throw new RangeError(`SearchBar scope does not exist: ${scopeId}.`);
    }

    if (!isScopeControlled()) {
      uncontrolledScopeId = scopeId;
    }

    options.onScopeChange?.(scopeId);

    return true;
  };
  const moveScope = (step: number): SearchBarScope | undefined => {
    const scopes = options.scopes ?? [];

    if (options.disabled === true || scopes.length === 0) {
      return activeScope();
    }

    const index = scopes.findIndex(({ id }) => id === currentScopeId());
    const next = scopes[(index + step + scopes.length) % scopes.length];

    if (next !== undefined) {
      requestScope(next.id);
    }

    return activeScope();
  };

  return {
    activeScope,
    clear() {
      const didClear = requestQuery('');

      if (didClear) {
        options.onClear?.();
      }

      return didClear;
    },
    nextScope: () => moveScope(1),
    previousScope: () => moveScope(-1),
    query: currentQuery,
    setOptions(nextOptions) {
      assertScopes(nextOptions.scopes ?? []);

      const previousQuery = currentQuery();
      const previousScopeId = currentScopeId();
      const queryWasControlled = isQueryControlled();
      const scopeWasControlled = isScopeControlled();

      resolveInitialScope(nextOptions);
      options = nextOptions;

      if (!isQueryControlled()) {
        uncontrolledQuery = queryWasControlled
          ? previousQuery
          : (nextOptions.defaultQuery ?? uncontrolledQuery);
      }

      if (!isScopeControlled()) {
        const nextScopes = options.scopes ?? [];
        const preserved = nextScopes.some(({ id }) => id === previousScopeId)
          ? previousScopeId
          : undefined;

        uncontrolledScopeId = scopeWasControlled
          ? (preserved ?? nextOptions.defaultScopeId ?? nextScopes[0]?.id)
          : (nextOptions.defaultScopeId ?? preserved ?? nextScopes[0]?.id);
      }
    },
    setQuery: requestQuery,
    setScope: requestScope,
    submit() {
      if (options.disabled === true) {
        return false;
      }

      const scope = activeScope();

      options.onSubmit?.({
        query: currentQuery(),
        ...(scope === undefined ? {} : { scope }),
      });

      return true;
    },
  };
}

function focused(
  value: string,
  target: SearchBarTarget,
  activeTarget: SearchBarTarget | undefined,
  characters: SearchBarCharacters,
): string {
  return target === activeTarget
    ? `${characters.activeLeft}${value}${characters.activeRight}`
    : value;
}

/** Renders one-line search, scope, result, clear, and submit controls. */
export function renderSearchBar({
  activeTarget,
  characters = SEARCH_BAR_UNICODE_CHARACTERS,
  disabled = false,
  pad = false,
  placeholder,
  query = '',
  resultCount,
  scopeId,
  scopes = [],
  showSubmit = true,
  width,
}: RenderSearchBarOptions): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('SearchBar width must be a non-negative integer.');
  }

  if (resultCount !== undefined && (!Number.isInteger(resultCount) || resultCount < 0)) {
    throw new RangeError('SearchBar resultCount must be a non-negative integer.');
  }

  assertScopes(scopes);

  if (width === 0) {
    return '';
  }

  const selectedScopeId = scopeId ?? scopes[0]?.id;
  const selectedScope = scopes.find(({ id }) => id === selectedScopeId);

  if (selectedScopeId !== undefined && selectedScope === undefined) {
    throw new RangeError(`SearchBar scope does not exist: ${selectedScopeId}.`);
  }

  const safeQuery = plainText(query);
  const safePlaceholder = placeholder === undefined ? undefined : plainText(placeholder);
  const displayQuery = safeQuery.length > 0 ? safeQuery : (safePlaceholder ?? characters.empty);
  const segments: string[] = [];

  if (selectedScope !== undefined) {
    segments.push(
      focused(
        `${characters.scopeLeft}${plainText(selectedScope.label)}${characters.scopeRight}`,
        'scope',
        disabled ? undefined : activeTarget,
        characters,
      ),
    );
  }

  segments.push(
    focused(
      `${characters.search} ${displayQuery}`,
      'query',
      disabled ? undefined : activeTarget,
      characters,
    ),
  );

  if (resultCount !== undefined) {
    segments.push(`${resultCount} ${resultCount === 1 ? 'result' : 'results'}`);
  }

  if (safeQuery.length > 0) {
    segments.push(
      focused(characters.clear, 'clear', disabled ? undefined : activeTarget, characters),
    );
  }

  if (showSubmit) {
    segments.push(
      focused(characters.submit, 'submit', disabled ? undefined : activeTarget, characters),
    );
  }

  if (disabled) {
    segments.push('(disabled)');
  }

  const content = truncateText(segments.join(` ${characters.separator} `), width);

  return pad ? `${content}${' '.repeat(Math.max(0, width - visibleWidth(content)))}` : content;
}
