import {
  type CollectionItem,
  type CollectionModel,
  createCollection,
} from '@/primitives/collection/index.js';

/**
 * Options accepted by {@link createFocusScope}.
 *
 * @typeParam TItem - Focusable item shape.
 */
export interface CreateFocusScopeOptions<TItem extends CollectionItem> {
  /** Preferred item focused when the scope activates. */
  initialFocusId?: string;

  /** Ordered focusable items. Disabled items are skipped. */
  items: readonly TItem[];

  /**
   * Whether focus wraps and remains inside the scope.
   *
   * @defaultValue `true`
   */
  trapped?: boolean;
}

/**
 * Headless focus capture, navigation, and restoration state.
 */
export interface FocusScopeModel {
  /**
   * Activates the scope and captures the identifier that should regain focus.
   *
   * @returns The item that should receive initial focus.
   */
  activate(previousFocusId?: string): string | undefined;

  /**
   * Deactivates the scope.
   *
   * @returns The captured identifier that should regain focus.
   */
  deactivate(): string | undefined;

  /** Returns the current focus identifier while active. */
  current(): string | undefined;

  /** Moves focus to an enabled item while active. */
  focus(id: string): string | undefined;

  /** Moves focus forward according to the trap policy. */
  next(): string | undefined;

  /** Moves focus backward according to the trap policy. */
  previous(): string | undefined;
}

/**
 * Creates terminal focus-scope behavior without accessing Blessed elements.
 *
 * Adapters apply returned identifiers to actual elements. Keeping focus
 * identity separate from element instances makes activation, trapping, and
 * restoration deterministic and testable.
 *
 * @typeParam TItem - Focusable item shape.
 * @param options - Ordered items, initial focus, and trap policy.
 * @returns Focus-scope state machine.
 */
export function createFocusScope<TItem extends CollectionItem>({
  initialFocusId,
  items,
  trapped = true,
}: CreateFocusScopeOptions<TItem>): FocusScopeModel {
  const collection: CollectionModel<TItem> = createCollection(items);

  let active = false;
  let currentId: string | undefined;
  let restoreFocusId: string | undefined;

  const move = (direction: 'next' | 'previous'): string | undefined => {
    if (!active) {
      return undefined;
    }

    const nextItem = collection[direction](currentId, { loop: trapped });

    if (nextItem !== undefined) {
      currentId = nextItem.id;
    }

    return nextItem?.id;
  };

  return {
    activate(previousFocusId) {
      active = true;
      restoreFocusId = previousFocusId;
      const preferred = initialFocusId === undefined ? undefined : collection.get(initialFocusId);

      currentId =
        preferred?.disabled === true
          ? collection.first()?.id
          : (preferred?.id ?? collection.first()?.id);

      return currentId;
    },
    current: () => (active ? currentId : undefined),
    deactivate() {
      const result = restoreFocusId;

      active = false;
      currentId = undefined;
      restoreFocusId = undefined;

      return result;
    },
    focus(id) {
      if (!active) {
        return undefined;
      }

      const item = collection.get(id);

      if (item === undefined || item.disabled === true) {
        return currentId;
      }

      currentId = id;

      return currentId;
    },
    next: () => move('next'),
    previous: () => move('previous'),
  };
}
