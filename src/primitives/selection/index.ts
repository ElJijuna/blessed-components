import {
  type CollectionItem,
  type CollectionModel,
  createCollection,
} from '../collection/index.js';

/**
 * Selection behavior supported by {@link createSelectionModel}.
 */
export type SelectionMode = 'multiple' | 'single';

/**
 * Options accepted by {@link createSelectionModel}.
 *
 * @typeParam TItem - Selectable item shape.
 */
export interface CreateSelectionModelOptions<TItem extends CollectionItem> {
  /**
   * Whether the current selection may become empty.
   *
   * @defaultValue `true`
   */
  allowEmpty?: boolean;

  /** Initial selected identifiers for uncontrolled state. */
  defaultSelectedIds?: readonly string[];

  /** Ordered selectable items. Disabled items cannot be selected. */
  items: readonly TItem[];

  /**
   * Selection cardinality.
   *
   * @defaultValue `'single'`
   */
  mode?: SelectionMode;

  /** Called synchronously after the selected identifiers change. */
  onChange?: (selectedIds: readonly string[]) => void;
}

/**
 * Headless selection state shared by lists, tables, trees, and menus.
 */
export interface SelectionModel {
  /** Clears selection when empty state is allowed. */
  clear(): boolean;

  /** Reports whether an identifier is selected. */
  isSelected(id: string): boolean;

  /** Selects one enabled item according to the configured mode. */
  select(id: string): boolean;

  /** Returns selected identifiers in collection order. */
  selectedIds(): string[];

  /** Toggles one enabled item. */
  toggle(id: string): boolean;
}

/**
 * Creates an uncontrolled, framework-independent selection model.
 *
 * Components that expose controlled state can mirror `selectedIds()` into
 * application state and recreate or synchronize the primitive at their
 * boundary. The primitive itself owns no rendering or Blessed elements.
 *
 * @typeParam TItem - Selectable item shape.
 * @param options - Items, cardinality, initial state, and change listener.
 * @returns Mutable selection behavior with immutable snapshots.
 */
export function createSelectionModel<TItem extends CollectionItem>({
  allowEmpty = true,
  defaultSelectedIds = [],
  items,
  mode = 'single',
  onChange,
}: CreateSelectionModelOptions<TItem>): SelectionModel {
  const collection: CollectionModel<TItem> = createCollection(items);
  const selectableIds = new Set(collection.enabledItems().map(({ id }) => id));
  const requested = defaultSelectedIds.filter((id) => selectableIds.has(id));
  const selected = new Set(mode === 'single' ? requested.slice(0, 1) : requested);
  const orderedSelection = (): string[] =>
    collection
      .items()
      .filter(({ id }) => selected.has(id))
      .map(({ id }) => id);
  const notify = (): void => {
    onChange?.(orderedSelection());
  };
  const clear = (): boolean => {
    if (!allowEmpty || selected.size === 0) {
      return false;
    }

    selected.clear();
    notify();

    return true;
  };

  return {
    clear,
    isSelected: (id) => selected.has(id),
    select(id) {
      if (!selectableIds.has(id) || (selected.size === 1 && selected.has(id))) {
        return false;
      }

      if (mode === 'single') {
        selected.clear();
      }

      selected.add(id);
      notify();

      return true;
    },
    selectedIds: orderedSelection,
    toggle(id) {
      if (!selectableIds.has(id)) {
        return false;
      }

      if (selected.has(id)) {
        if (!allowEmpty && selected.size === 1) {
          return false;
        }

        selected.delete(id);
        notify();

        return true;
      }

      if (mode === 'single') {
        selected.clear();
      }

      selected.add(id);
      notify();

      return true;
    },
  };
}
