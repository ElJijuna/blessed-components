import { type RenderTextOptions, renderText } from '@/components/data-display/text/index.js';

/** Options accepted by {@link createDialogState}. */
export interface CreateDialogStateOptions {
  /** Initial state for uncontrolled usage. @defaultValue `false` */
  defaultOpen?: boolean;

  /** Called when Dialog requests an open-state change. */
  onOpenChange?: (open: boolean) => void;

  /** Controlled open state. */
  open?: boolean;
}

/** Controlled or uncontrolled Dialog open-state model. */
export interface DialogStateModel {
  /** Requests closing and returns resulting observable state. */
  close(): boolean;

  /** Returns current controlled or uncontrolled open state. */
  isOpen(): boolean;

  /** Requests opening and returns resulting observable state. */
  open(): boolean;

  /** Replaces controlled/uncontrolled options. */
  setOptions(options: CreateDialogStateOptions): boolean;

  /** Requests opposite state and returns resulting observable state. */
  toggle(): boolean;
}

/**
 * Creates controlled or uncontrolled Dialog open state.
 *
 * Controlled requests emit `onOpenChange`; observable state changes only after
 * `setOptions()` receives a new `open` value.
 */
export function createDialogState(initialOptions: CreateDialogStateOptions = {}): DialogStateModel {
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

/** Options accepted by {@link renderDialogRegion}. */
export interface RenderDialogRegionOptions extends Omit<RenderTextOptions, 'content'> {
  /** Dynamic region text. ANSI sequences and Blessed tags are removed. */
  content?: string;
}

/** Renders safe text for one independently composable Dialog region. */
export function renderDialogRegion({
  content = '',
  ...options
}: RenderDialogRegionOptions = {}): string {
  return renderText({ ...options, content });
}
