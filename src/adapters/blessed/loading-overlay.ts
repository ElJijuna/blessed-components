import blessed from 'blessed';

import {
  type RenderLoadingOverlayOptions,
  renderLoadingOverlay,
} from '@/components/feedback/loading-overlay/index.js';
import {
  SPINNER_ASCII_FRAMES,
  SPINNER_UNICODE_FRAMES,
} from '@/components/feedback/spinner/index.js';
import {
  type CreateOverlayStateOptions,
  createOverlayState,
} from '@/components/overlays/overlay/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import { getScreenOverlayStack } from './overlay-stack.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the LoadingOverlay adapter. */
export type LoadingOverlayBoxOptions = BoxElementOptions;

/** Information emitted after LoadingOverlay advances one frame. */
export interface LoadingOverlayFrameContext {
  /** Rendered frame index before modulo normalization. */
  frame: number;

  /** Current rendered overlay content. */
  content: string;
}

/** Stateful data accepted by the Blessed {@link loadingOverlay} adapter. */
export interface LoadingOverlayData
  extends Omit<RenderLoadingOverlayOptions, 'frame' | 'frames'>,
    CreateOverlayStateOptions,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Whether animation starts while the overlay is open. @defaultValue `true` */
  autoStart?: boolean;

  /** Explicit capabilities used for deterministic output. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Whether Escape requests closing while this overlay is topmost. @defaultValue `false` */
  dismissOnEscape?: boolean;

  /** Custom ordered one-cell animation frames. */
  frames?: readonly string[];

  /** Stable overlay identifier. */
  id: string;

  /** Timer delay in milliseconds. @defaultValue `80` */
  interval?: number;

  /** Called after an owned timer or manual tick advances the frame. */
  onFrame?: (context: LoadingOverlayFrameContext) => void;

  /** Semantic foreground token. @defaultValue `'primary'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link loadingOverlay} adapter. */
export interface LoadingOverlayOptions {
  /** Full-screen layer position, style, and standard Blessed settings. */
  box?: LoadingOverlayBoxOptions;

  /** Visibility, animation, content, and theme data. */
  data: LoadingOverlayData;

  /** Blessed screen or node receiving the LoadingOverlay. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link loadingOverlay}. */
export interface LoadingOverlayHandle
  extends BlessedComponentHandle<LoadingOverlayData, blessed.Widgets.BoxElement> {
  /** Whether LoadingOverlay currently owns an active interval timer. */
  readonly running: boolean;

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

  /** Starts animation. Repeated calls are idempotent. */
  start(): void;

  /** Stops animation without destroying the element. */
  stop(): void;

  /** Advances and renders exactly one frame. */
  tick(): void;

  /** Requests opposite open state. */
  toggle(): boolean;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined;
}

function innerDimension(
  outer: blessed.Widgets.Types.TPosition,
  inset: blessed.Widgets.Types.TPosition,
): number | undefined {
  const outerSize = numericDimension(outer);

  return outerSize === undefined
    ? undefined
    : Math.max(0, outerSize - (numericDimension(inset) ?? 0));
}

function validateInterval(interval: number): void {
  if (!Number.isInteger(interval) || interval < 1) {
    throw new RangeError('LoadingOverlay interval must be a positive integer.');
  }
}

/** Creates a modal loading layer backed by a Blessed box. */
export function loadingOverlay({
  box,
  data: initialData,
  parent,
}: LoadingOverlayOptions): LoadingOverlayHandle {
  let data = initialData;
  let active = false;
  let destroyed = false;
  let frame = 0;
  let previousFocus: blessed.Widgets.BlessedElement | undefined;
  let timer: NodeJS.Timeout | undefined;

  validateInterval(initialData.interval ?? 80);

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
    foregroundTone: 'primary',
  });
  const render = (): string => {
    validateInterval(data.interval ?? 80);

    const {
      align,
      backgroundTone,
      borderTone,
      capabilities: configuredCapabilities,
      description,
      frames: configuredFrames,
      height: configuredHeight,
      label,
      showSpinner,
      theme,
      tone,
      width: configuredWidth,
    } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const frames =
      configuredFrames ?? (capabilities.unicode ? SPINNER_UNICODE_FRAMES : SPINNER_ASCII_FRAMES);
    const width = configuredWidth ?? innerDimension(element.width, element.iwidth);
    const height = configuredHeight ?? innerDimension(element.height, element.iheight);
    const content = renderLoadingOverlay({
      ...(align === undefined ? {} : { align }),
      ...(description === undefined ? {} : { description }),
      frame,
      frames,
      ...(height === undefined ? {} : { height }),
      ...(label === undefined ? {} : { label }),
      ...(showSpinner === undefined ? {} : { showSpinner }),
      ...(width === undefined || width === 0 ? {} : { width }),
    });

    element.setContent(content);
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: tone,
      theme,
    });

    return content;
  };
  const stop = (): void => {
    if (timer === undefined) {
      return;
    }

    clearInterval(timer);
    timer = undefined;
  };
  const start = (): void => {
    if (destroyed || !active || timer !== undefined || data.autoStart === false) {
      return;
    }

    const interval = data.interval ?? 80;

    validateInterval(interval);
    timer = setInterval(handle.tick, interval);
    timer.unref();
  };
  const activate = (): void => {
    if (active || destroyed) {
      return;
    }

    previousFocus = screen.focused;
    overlays.open({
      dismissOnEscape: data.dismissOnEscape ?? false,
      id: data.id,
      modal: true,
    });
    active = true;
    element.show();
    element.setFront();
    render();
    element.emitDescendants('resize');
    element.focus();
    start();
  };
  const deactivate = (): void => {
    if (!active) {
      return;
    }

    stop();
    overlays.close(data.id);
    active = false;
    element.hide();

    if (previousFocus !== undefined && !previousFocus.detached) {
      previousFocus.focus();
    }

    previousFocus = undefined;
  };
  const sync = (): void => {
    if (state.isOpen()) {
      activate();
      render();
      start();
    } else {
      deactivate();
    }
  };
  const handle: LoadingOverlayHandle = {
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
    get running() {
      return timer !== undefined;
    },
    open() {
      state.open();
      sync();

      return state.isOpen();
    },
    setData(nextData) {
      const previousId = data.id;
      const wasRunning = timer !== undefined;

      if (active && nextData.id !== previousId) {
        throw new RangeError('Open LoadingOverlay id cannot change.');
      }

      stop();
      data = nextData;
      state.setOptions(nextData);
      sync();

      if (wasRunning) {
        start();
      }
    },
    start,
    stop,
    tick() {
      if (destroyed || !active) {
        return;
      }

      frame += 1;

      const content = render();

      data.onFrame?.({ content, frame });
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

    if ((key.full ?? key.name) === 'escape' && (data.dismissOnEscape ?? false)) {
      handle.close();
    }
  };

  screen.on('keypress', onKeypress);
  sync();

  return handle;
}
