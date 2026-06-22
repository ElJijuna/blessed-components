import blessed from 'blessed';

import {
  type RenderSpinnerOptions,
  renderSpinner,
  SPINNER_ASCII_FRAMES,
  SPINNER_UNICODE_FRAMES,
} from '@/components/feedback/spinner/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Spinner adapter. */
export type SpinnerBoxOptions = BoxElementOptions;

/** Information emitted after Spinner advances one frame. */
export interface SpinnerFrameContext {
  /** Rendered frame index before modulo normalization. */
  frame: number;

  /** Current rendered Spinner content. */
  content: string;
}

/** Stateful data accepted by the Blessed {@link spinner} adapter. */
export interface SpinnerData
  extends Omit<RenderSpinnerOptions, 'frame' | 'frames'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Whether animation starts immediately. @defaultValue `true` */
  autoStart?: boolean;

  /** Explicit capabilities used for deterministic output. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom ordered one-cell animation frames. */
  frames?: readonly string[];

  /** Timer delay in milliseconds. @defaultValue `80` */
  interval?: number;

  /** Called after an owned timer or manual tick advances the frame. */
  onFrame?: (context: SpinnerFrameContext) => void;

  /** Semantic foreground token. @defaultValue `'primary'` */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link spinner} adapter. */
export interface SpinnerOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: SpinnerBoxOptions;

  /** Animation, label, capabilities, and theme data. */
  data?: SpinnerData;

  /** Blessed screen or node receiving the Spinner. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link spinner}. */
export interface SpinnerHandle
  extends BlessedComponentHandle<SpinnerData, blessed.Widgets.BoxElement> {
  /** Whether Spinner currently owns an active interval timer. */
  readonly running: boolean;

  /** Starts animation. Repeated calls are idempotent. */
  start(): void;

  /** Stops animation without destroying the element. */
  stop(): void;

  /** Advances and renders exactly one frame. */
  tick(): void;
}

function validateInterval(interval: number): void {
  if (!Number.isInteger(interval) || interval < 1) {
    throw new RangeError('Spinner interval must be a positive integer.');
  }
}

/**
 * Creates an animated themed Spinner backed by a Blessed box.
 *
 * Spinner updates element content but never calls `screen.render()`. Use
 * `onFrame` to integrate with an application render loop.
 */
export function spinner({ box, data: initialData = {}, parent }: SpinnerOptions): SpinnerHandle {
  let data = initialData;
  let frame = 0;
  let timer: NodeJS.Timeout | undefined;
  let destroyed = false;

  validateInterval(initialData.interval ?? 80);

  const element = blessed.box({
    ...box,
    content: '',
    parent,
    style: {
      ...box?.style,
      border: { ...box?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, box, {
    foregroundTone: 'primary',
  });
  const render = (): string => {
    validateInterval(data.interval ?? 80);

    const {
      backgroundTone,
      borderTone,
      capabilities: configuredCapabilities,
      frames: configuredFrames,
      label,
      theme,
      tone,
    } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const frames =
      configuredFrames ?? (capabilities.unicode ? SPINNER_UNICODE_FRAMES : SPINNER_ASCII_FRAMES);
    const content = renderSpinner({
      frame,
      frames,
      ...(label === undefined ? {} : { label }),
    });

    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: tone,
      theme,
    });
    element.setContent(content);

    return content;
  };
  const stop = (): void => {
    if (timer === undefined) {
      return;
    }

    clearInterval(timer);
    timer = undefined;
  };
  const tick = (): void => {
    if (destroyed) {
      return;
    }

    frame += 1;

    const content = render();

    data.onFrame?.({ content, frame });
  };
  const start = (): void => {
    if (destroyed || timer !== undefined) {
      return;
    }

    const interval = data.interval ?? 80;

    validateInterval(interval);
    timer = setInterval(tick, interval);
    timer.unref();
  };

  render();

  if (data.autoStart !== false) {
    start();
  }

  return {
    destroy() {
      destroyed = true;
      stop();
      element.destroy();
    },
    element,
    get running() {
      return timer !== undefined;
    },
    setData(nextData) {
      const wasRunning = timer !== undefined;

      stop();
      data = nextData;
      render();

      if (wasRunning) {
        start();
      }
    },
    start,
    stop,
    tick,
  };
}
