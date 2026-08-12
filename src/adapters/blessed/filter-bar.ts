import blessed from 'blessed';

import {
  FILTER_BAR_ASCII_CHARACTERS,
  FILTER_BAR_UNICODE_CHARACTERS,
  type FilterBarCharacters,
  type FilterBarFilter,
  type FilterBarTarget,
  renderFilterBarModel,
} from '@/components/navigation/filter-bar/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { BlessedComponentHandle } from './types.js';

export type FilterBarBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

export interface FilterBarData<TFilter extends FilterBarFilter = FilterBarFilter> {
  activeTarget?: FilterBarTarget;
  capabilities?: Pick<TerminalCapabilities, 'unicode'>;
  characters?: FilterBarCharacters;
  filters?: readonly TFilter[];
  onActiveTargetChange?: (target: FilterBarTarget) => void;
  onClear?: () => void;
  onRemoveFilter?: (filter: TFilter) => void;
  onReset?: () => void;
  query?: string;
  resultCount?: number;
  showReset?: boolean;
  width?: number;
}

export interface FilterBarOptions<TFilter extends FilterBarFilter = FilterBarFilter> {
  box?: FilterBarBoxOptions;
  data?: FilterBarData<TFilter>;
  parent: blessed.Widgets.Node;
}

export interface FilterBarHandle<TFilter extends FilterBarFilter = FilterBarFilter>
  extends BlessedComponentHandle<FilterBarData<TFilter>, blessed.Widgets.BoxElement> {
  activateActive(): FilterBarTarget | undefined;
  activeTarget(): FilterBarTarget | undefined;
  focus(): void;
  focusTarget(target: FilterBarTarget): FilterBarTarget | undefined;
  next(): FilterBarTarget | undefined;
  previous(): FilterBarTarget | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive filtering summary backed by a Blessed box. */
export function filterBar<TFilter extends FilterBarFilter>({
  box,
  data: initialData = {},
  parent,
}: FilterBarOptions<TFilter>): FilterBarHandle<TFilter> {
  let data = initialData;
  let active = data.activeTarget;
  let targets: FilterBarTarget[] = [];

  const element = blessed.box({
    height: 1,
    keys: true,
    mouse: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const width = () =>
    data.width ?? Math.max(0, dimension(element.width) - dimension(element.iwidth));
  const allTargets = (): FilterBarTarget[] => {
    const filters: FilterBarTarget[] = (data.filters ?? [])
      .filter(({ removable }) => removable !== false)
      .map(({ id }) => `filter:${id}` as const);
    const query = data.query?.trim() ?? '';

    if (filters.length > 0 || query.length > 0) {
      filters.push('clear');
    }

    if (data.showReset) {
      filters.push('reset');
    }

    return filters;
  };
  const render = () => {
    const capabilities = data.capabilities ?? detectCapabilities();
    const result = renderFilterBarModel({
      ...data,
      ...(active === undefined ? {} : { activeTarget: active }),
      characters:
        data.characters ??
        (capabilities.unicode ? FILTER_BAR_UNICODE_CHARACTERS : FILTER_BAR_ASCII_CHARACTERS),
      width: width(),
    });

    targets = [...result.visibleTargets];
    element.setContent(result.content);
  };
  const setActive = (target: FilterBarTarget | undefined) => {
    if (target !== undefined && target !== active && allTargets().includes(target)) {
      active = target;
      data.onActiveTargetChange?.(target);
      render();
    }

    return active;
  };
  const move = (step: number) => {
    const available = allTargets();

    if (available.length === 0) {
      return undefined;
    }

    const index = active === undefined ? -1 : available.indexOf(active);

    return setActive(available[(index + step + available.length) % available.length]);
  };

  active = allTargets().includes(active as FilterBarTarget) ? active : allTargets()[0];
  render();

  const handle: FilterBarHandle<TFilter> = {
    activateActive() {
      if (active === 'clear') {
        data.onClear?.();
      } else if (active === 'reset') {
        data.onReset?.();
      } else if (active?.startsWith('filter:')) {
        const filter = (data.filters ?? []).find(({ id }) => `filter:${id}` === active);

        if (filter !== undefined && filter.removable !== false) {
          data.onRemoveFilter?.(filter);
        }
      }

      return active;
    },
    activeTarget: () => active,
    destroy: () => element.destroy(),
    element,
    focus: () => element.focus(),
    focusTarget: setActive,
    next: () => move(1),
    previous: () => move(-1),
    setData(nextData) {
      data = nextData;

      if (!allTargets().includes(active as FilterBarTarget)) {
        active = data.activeTarget ?? allTargets()[0];
      }

      render();
    },
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'left':
      case 'shift-tab':
        handle.previous();
        break;
      case 'right':
      case 'tab':
        handle.next();
        break;
      case 'enter':
      case 'space':
      case 'delete':
      case 'backspace':
        handle.activateActive();
        break;
    }
  });
  element.on('click', () => {
    const [target] = targets;

    if (target !== undefined) {
      handle.focusTarget(target);
    }
  });
  element.on('resize', render);

  return handle;
}
