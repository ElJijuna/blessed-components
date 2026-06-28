/** Options accepted by {@link createOverlayState}. */
export interface CreateOverlayStateOptions {
  /** Initial state for uncontrolled usage. @defaultValue `false` */
  defaultOpen?: boolean;

  /** Called when Overlay requests an open-state change. */
  onOpenChange?: (open: boolean) => void;

  /** Controlled open state. */
  open?: boolean;
}

/** Controlled or uncontrolled Overlay open-state model. */
export interface OverlayStateModel {
  /** Requests closing and returns resulting observable state. */
  close(): boolean;

  /** Returns current controlled or uncontrolled open state. */
  isOpen(): boolean;

  /** Requests opening and returns resulting observable state. */
  open(): boolean;

  /** Replaces controlled/uncontrolled options. */
  setOptions(options: CreateOverlayStateOptions): boolean;

  /** Requests opposite state and returns resulting observable state. */
  toggle(): boolean;
}

/**
 * Creates controlled or uncontrolled Overlay open state.
 *
 * Controlled requests emit `onOpenChange`; observable state changes only after
 * `setOptions()` receives a new `open` value.
 */
export function createOverlayState(
  initialOptions: CreateOverlayStateOptions = {},
): OverlayStateModel {
  let options = initialOptions;
  let uncontrolledOpen = initialOptions.defaultOpen ?? false;

  const isControlled = (): boolean => Object.hasOwn(options, 'open');
  const isOpen = (): boolean => (isControlled() ? (options.open ?? false) : uncontrolledOpen);
  const request = (nextOpen: boolean): boolean => {
    if (nextOpen === isOpen()) {
      return isOpen();
    }

    if (!isControlled()) {
      uncontrolledOpen = nextOpen;
    }

    options.onOpenChange?.(nextOpen);

    return isOpen();
  };

  return {
    close: () => request(false),
    isOpen,
    open: () => request(true),
    setOptions(nextOptions) {
      const previousOpen = isOpen();
      const wasControlled = isControlled();

      options = nextOptions;

      if (wasControlled && !isControlled()) {
        uncontrolledOpen = previousOpen;
      }

      return isOpen();
    },
    toggle: () => request(!isOpen()),
  };
}
