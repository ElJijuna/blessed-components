export interface KeyEvent {
  /** Whether the Control modifier is active. */
  ctrl?: boolean;
  /** Whether the Meta or Alt modifier is active. */
  meta?: boolean;
  /** Normalized key name reported by the terminal adapter. */
  name: string;
  /** Whether the Shift modifier is active. */
  shift?: boolean;
}

export interface KeyBinding {
  /** Human-readable action description used by help views. */
  description: string;
  /** Function invoked when any configured chord matches. */
  handler: () => void;
  /** Stable action identifier. */
  id: string;
  /** Accepted chords, such as `C-s` or `M-enter`. */
  keys: readonly string[];
}

export interface KeymapHelpItem {
  /** Human-readable action description. */
  description: string;
  /** Stable action identifier. */
  id: string;
  /** Chords that trigger the action. */
  keys: readonly string[];
}

export interface Keymap {
  /** Handles one normalized key event and reports whether it matched. */
  handle(event: KeyEvent): boolean;
  /** Returns immutable help metadata for all bindings. */
  help(): KeymapHelpItem[];
}

function normalizeChord(event: KeyEvent): string {
  return [
    event.ctrl ? 'C' : undefined,
    event.meta ? 'M' : undefined,
    event.shift ? 'S' : undefined,
    event.name.toLowerCase(),
  ]
    .filter((part) => part !== undefined)
    .join('-')
    .toLowerCase();
}

/**
 * Creates a keymap that handles normalized chords and exposes help metadata.
 */
export function createKeymap(bindings: readonly KeyBinding[]): Keymap {
  const handlers = new Map<string, () => void>();

  for (const binding of bindings) {
    for (const key of binding.keys) {
      handlers.set(key.toLowerCase(), binding.handler);
    }
  }

  return {
    handle(event) {
      const handler = handlers.get(normalizeChord(event));

      if (handler === undefined) {
        return false;
      }

      handler();

      return true;
    },
    help() {
      return bindings.map(({ description, id, keys }) => ({
        description,
        id,
        keys: [...keys],
      }));
    },
  };
}
