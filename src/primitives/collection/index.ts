/**
 * Minimum shape required by collection-based terminal primitives.
 */
export interface CollectionItem {
  /** Whether navigation and interaction must skip the item. */
  disabled?: boolean;

  /** Stable identifier used for navigation and state. */
  id: string;
}

/**
 * Options controlling one collection navigation operation.
 */
export interface CollectionNavigationOptions {
  /**
   * Whether navigation wraps at collection boundaries.
   *
   * @defaultValue `true`
   */
  loop?: boolean;
}

/**
 * Read-only ordered collection used by selection and focus primitives.
 *
 * @typeParam TItem - Public item shape retained by the collection.
 */
export interface CollectionModel<TItem extends CollectionItem> {
  /** Returns all enabled items in input order. */
  enabledItems(): TItem[];

  /** Returns the first enabled item. */
  first(): TItem | undefined;

  /** Finds an item by its stable identifier. */
  get(id: string): TItem | undefined;

  /** Returns a defensive copy of all items in input order. */
  items(): TItem[];

  /** Returns the last enabled item. */
  last(): TItem | undefined;

  /** Returns the next enabled item relative to `id`. */
  next(id?: string, options?: CollectionNavigationOptions): TItem | undefined;

  /** Returns the previous enabled item relative to `id`. */
  previous(id?: string, options?: CollectionNavigationOptions): TItem | undefined;

  /** Number of items, including disabled items. */
  readonly size: number;
}

/**
 * Creates an immutable ordered collection facade.
 *
 * The model preserves caller item identities but never mutates the source
 * array or its objects. Duplicate identifiers are rejected because every
 * stateful primitive depends on unambiguous item identity.
 *
 * @typeParam TItem - Item shape retained by the collection.
 * @param source - Ordered items with stable identifiers.
 * @returns Navigation and lookup operations over the source items.
 */
export function createCollection<TItem extends CollectionItem>(
  source: readonly TItem[],
): CollectionModel<TItem> {
  const items = [...source];
  const byId = new Map(items.map((item) => [item.id, item]));

  if (byId.size !== items.length) {
    throw new RangeError('Collection item ids must be unique.');
  }

  const enabled = items.filter(({ disabled }) => disabled !== true);
  const navigate = (
    id: string | undefined,
    offset: -1 | 1,
    { loop = true }: CollectionNavigationOptions = {},
  ): TItem | undefined => {
    if (enabled.length === 0) {
      return undefined;
    }

    if (id === undefined) {
      return offset === 1 ? enabled[0] : enabled.at(-1);
    }

    const index = enabled.findIndex((item) => item.id === id);

    if (index < 0) {
      return offset === 1 ? enabled[0] : enabled.at(-1);
    }

    const nextIndex = index + offset;

    if (nextIndex >= 0 && nextIndex < enabled.length) {
      return enabled[nextIndex];
    }

    if (!loop) {
      return undefined;
    }

    return offset === 1 ? enabled[0] : enabled.at(-1);
  };

  return {
    enabledItems: () => [...enabled],
    first: () => enabled[0],
    get: (id) => byId.get(id),
    items: () => [...items],
    last: () => enabled.at(-1),
    next: (id, options) => navigate(id, 1, options),
    previous: (id, options) => navigate(id, -1, options),
    size: items.length,
  };
}
