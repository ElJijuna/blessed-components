import { type RenderTextOptions, renderText } from '@/components/data-display/text/index.js';

/** Edge a Drawer panel is attached to. */
export type DrawerEdge = 'bottom' | 'left' | 'right' | 'top';

/** Options accepted by {@link createDrawerState}. */
export interface CreateDrawerStateOptions {
  /** Initial state for uncontrolled usage. @defaultValue `false` */
  defaultOpen?: boolean;

  /** Called when Drawer requests an open-state change. */
  onOpenChange?: (open: boolean) => void;

  /** Controlled open state. */
  open?: boolean;
}

/** Controlled or uncontrolled Drawer open-state model. */
export interface DrawerStateModel {
  /** Requests closing and returns resulting observable state. */
  close(): boolean;

  /** Returns current controlled or uncontrolled open state. */
  isOpen(): boolean;

  /** Requests opening and returns resulting observable state. */
  open(): boolean;

  /** Replaces controlled/uncontrolled options. */
  setOptions(options: CreateDrawerStateOptions): boolean;

  /** Requests opposite state and returns resulting observable state. */
  toggle(): boolean;
}

/**
 * Creates controlled or uncontrolled Drawer open state.
 *
 * Controlled requests emit `onOpenChange`; observable state changes only after
 * `setOptions()` receives a new `open` value.
 */
export function createDrawerState(initialOptions: CreateDrawerStateOptions = {}): DrawerStateModel {
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

/** Options accepted by {@link renderDrawerRegion}. */
export interface RenderDrawerRegionOptions extends Omit<RenderTextOptions, 'content'> {
  /** Dynamic region text. ANSI sequences and Blessed tags are removed. */
  content?: string;
}

/** Renders safe text for one independently composable Drawer region. */
export function renderDrawerRegion({
  content = '',
  ...options
}: RenderDrawerRegionOptions = {}): string {
  return renderText({ ...options, content });
}
