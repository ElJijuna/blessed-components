export interface FocusItem {
  disabled?: boolean;
  id: string;
}

export interface FocusModel {
  current(): string | undefined;
  focus(id: string): string | undefined;
  next(): string | undefined;
  previous(): string | undefined;
}

/**
 * Creates a wrapping focus model that skips disabled items.
 */
export function createFocusModel(items: readonly FocusItem[], initialId?: string): FocusModel {
  const enabled = items.filter(({ disabled }) => disabled !== true);

  let index = Math.max(
    0,
    initialId === undefined ? 0 : enabled.findIndex(({ id }) => id === initialId),
  );

  const move = (offset: number): string | undefined => {
    if (enabled.length === 0) {
      return undefined;
    }

    index = (index + offset + enabled.length) % enabled.length;

    return enabled[index]?.id;
  };

  return {
    current() {
      return enabled[index]?.id;
    },
    focus(id) {
      const nextIndex = enabled.findIndex((item) => item.id === id);

      if (nextIndex >= 0) {
        index = nextIndex;
      }

      return enabled[index]?.id;
    },
    next() {
      return move(1);
    },
    previous() {
      return move(-1);
    },
  };
}
