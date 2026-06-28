import blessed from 'blessed';

import {
  type CreateOverlayStateOptions,
  createOverlayState,
} from '@/components/overlays/overlay/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import { getScreenOverlayStack } from './overlay-stack.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Overlay adapter. */
export type OverlayBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link overlay} adapter. */
export interface OverlayData extends BoxData, CreateOverlayStateOptions {
  /** Whether Escape requests closing while this overlay is topmost. @defaultValue `true` */
  dismissOnEscape?: boolean;

  /** Stable overlay identifier. */
  id: string;

  /** Whether this overlay blocks lower overlay layers. @defaultValue `false` */
  modal?: boolean;
}

/** Options accepted by the Blessed {@link overlay} adapter. */
export interface OverlayOptions {
  /** Full-screen layer position, style, and standard Blessed settings. */
  box?: OverlayBoxOptions;

  /** Identity, state, dismissal, stacking, and theme configuration. */
  data: OverlayData;

  /** Blessed screen or node receiving the Overlay layer. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link overlay}. */
export interface OverlayHandle
  extends BlessedComponentHandle<OverlayData, blessed.Widgets.BoxElement> {
  /** Current controlled or uncontrolled open state. */
  readonly isOpen: boolean;

  /** Whether a modal layer above this overlay blocks interaction. */
  blocked(): boolean;

  /** Requests closing. */
  close(): boolean;

  /** Gives terminal focus to the overlay element. */
  focus(): void;

  /** Requests opening. */
  open(): boolean;

  /** Requests opposite open state. */
  toggle(): boolean;
}

interface Keypress {
  full?: string;
  name?: string;
}

/**
 * Creates a visual overlay layer backed by the shared Blessed overlay stack.
 *
 * Overlay manages visibility, z-order, Escape dismissal, and focus restoration.
 * Pass `handle.element` as parent to compose arbitrary child content.
 */
export function overlay({ box, data: initialData, parent }: OverlayOptions): OverlayHandle {
  let data = initialData;
  let active = false;
  let destroyed = false;
  let previousFocus: blessed.Widgets.BlessedElement | undefined;

  const { screen } = parent;
  const overlays = getScreenOverlayStack(screen);
  const state = createOverlayState(initialData);
  const element = blessed.box({
    bottom: 0,
    keyable: true,
    left: 0,
    right: 0,
    top: 0,
    ...box,
    content: '',
    hidden: true,
    parent,
    style: {
      ...box?.style,
      border: { ...box?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, box, {
    backgroundTone: 'background',
    foregroundTone: 'foreground',
  });
  const activate = (): void => {
    if (active || destroyed) {
      return;
    }

    previousFocus = screen.focused;
    overlays.open({
      dismissOnEscape: data.dismissOnEscape ?? true,
      id: data.id,
      modal: data.modal ?? false,
    });
    active = true;
    element.show();
    element.setFront();
    element.emitDescendants('resize');
    element.focus();
  };
  const deactivate = (): void => {
    if (!active) {
      return;
    }

    overlays.close(data.id);
    active = false;
    element.hide();

    if (previousFocus !== undefined && !previousFocus.detached) {
      previousFocus.focus();
    }

    previousFocus = undefined;
  };
  const sync = (): void => {
    style.apply(data);

    if (state.isOpen()) {
      activate();
    } else {
      deactivate();
    }
  };
  const handle: OverlayHandle = {
    blocked: () => active && overlays.isBlocked(data.id),
    close() {
      state.close();
      sync();

      return state.isOpen();
    },
    destroy() {
      destroyed = true;
      screen.removeListener('keypress', onKeypress);
      deactivate();
      element.destroy();
    },
    element,
    focus() {
      element.focus();
    },
    get isOpen() {
      return state.isOpen();
    },
    open() {
      state.open();
      sync();

      return state.isOpen();
    },
    setData(nextData) {
      const previousId = data.id;

      if (active && nextData.id !== previousId) {
        throw new RangeError('Open Overlay id cannot change.');
      }

      data = nextData;
      state.setOptions(nextData);
      sync();
    },
    toggle() {
      state.toggle();
      sync();

      return state.isOpen();
    },
  };
  const onKeypress = (_character: string, key: Keypress): void => {
    if (!active || overlays.top()?.id !== data.id) {
      return;
    }

    if ((key.full ?? key.name) === 'escape' && (data.dismissOnEscape ?? true)) {
      handle.close();
    }
  };

  screen.on('keypress', onKeypress);
  sync();

  return handle;
}
