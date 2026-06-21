/**
 * Input used to open one overlay layer.
 */
export interface OverlayInput {
  /**
   * Whether Escape may dismiss this overlay when it is the top layer.
   *
   * @defaultValue `true`
   */
  dismissOnEscape?: boolean;

  /** Stable overlay identifier. */
  id: string;

  /**
   * Whether this layer blocks interaction with all layers below it.
   *
   * @defaultValue `false`
   */
  modal?: boolean;

  /** Focus identifier restored after the overlay closes. */
  restoreFocusId?: string;
}

/**
 * Normalized overlay state stored in the stack.
 */
export interface OverlayEntry {
  /** Whether Escape may dismiss the top overlay. */
  dismissOnEscape: boolean;

  /** Stable overlay identifier. */
  id: string;

  /** Whether lower layers are blocked. */
  modal: boolean;

  /** Focus identifier restored after close. */
  restoreFocusId?: string;
}

/**
 * Result returned when an overlay closes.
 */
export interface OverlayCloseResult {
  /** Removed overlay entry. */
  overlay: OverlayEntry;

  /** Focus identifier the adapter should restore. */
  restoreFocusId?: string;
}

/**
 * Headless ordered overlay and modal-layer state.
 */
export interface OverlayStackModel {
  /**
   * Closes an overlay by id, or the top overlay when no id is supplied.
   */
  close(id?: string): OverlayCloseResult | undefined;

  /** Returns an immutable bottom-to-top stack snapshot. */
  entries(): OverlayEntry[];

  /** Handles Escape against only the top layer. */
  handleEscape(): OverlayCloseResult | undefined;

  /** Reports whether a modal layer above an overlay blocks interaction. */
  isBlocked(id: string): boolean;

  /** Opens a new top layer. */
  open(input: OverlayInput): OverlayEntry;

  /** Returns the current top layer. */
  top(): OverlayEntry | undefined;
}

/**
 * Creates overlay ordering, modal blocking, dismissal, and focus-return state.
 *
 * Rendering and element focus remain adapter responsibilities. This model only
 * determines which layer is active and what should happen when it closes.
 *
 * @returns Empty overlay stack.
 */
export function createOverlayStack(): OverlayStackModel {
  const stack: OverlayEntry[] = [];
  const close = (id = stack.at(-1)?.id): OverlayCloseResult | undefined => {
    if (id === undefined) {
      return undefined;
    }

    const index = stack.findIndex((entry) => entry.id === id);

    if (index < 0) {
      return undefined;
    }

    const [overlay] = stack.splice(index, 1);

    if (overlay === undefined) {
      return undefined;
    }

    return overlay.restoreFocusId === undefined
      ? { overlay: { ...overlay } }
      : { overlay: { ...overlay }, restoreFocusId: overlay.restoreFocusId };
  };

  return {
    close,
    entries: () => stack.map((entry) => ({ ...entry })),
    handleEscape() {
      const overlay = stack.at(-1);

      return overlay?.dismissOnEscape === true ? close(overlay.id) : undefined;
    },
    isBlocked(id) {
      const index = stack.findIndex((entry) => entry.id === id);

      return index >= 0 && stack.slice(index + 1).some(({ modal }) => modal);
    },
    open({ dismissOnEscape = true, id, modal = false, restoreFocusId }) {
      if (stack.some((entry) => entry.id === id)) {
        throw new RangeError(`Overlay id "${id}" is already open.`);
      }

      const entry: OverlayEntry =
        restoreFocusId === undefined
          ? { dismissOnEscape, id, modal }
          : { dismissOnEscape, id, modal, restoreFocusId };

      stack.push(entry);

      return { ...entry };
    },
    top() {
      const entry = stack.at(-1);

      return entry === undefined ? undefined : { ...entry };
    },
  };
}
