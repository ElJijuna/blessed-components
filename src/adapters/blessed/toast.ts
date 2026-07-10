import blessed from 'blessed';

import {
  type CreateToastStackStateOptions,
  createToastStackState,
  type RenderToastStackOptions,
  renderToastStack,
  type ToastItem,
} from '@/components/feedback/toast/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Toast adapter. */
export type ToastBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link toast} adapter. */
export interface ToastData
  extends CreateToastStackStateOptions,
    Omit<RenderToastStackOptions, 'toasts'>,
    Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. @defaultValue `'foreground'` */
  foregroundTone?: BoxData['foregroundTone'];
}

/** Options accepted by the Blessed {@link toast} adapter. */
export interface ToastOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: ToastBoxOptions;

  /** Toast stack content, layout, and theme data. */
  data?: ToastData;

  /** Blessed screen or node receiving the Toast stack. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link toast}. */
export interface ToastHandle extends BlessedComponentHandle<ToastData, blessed.Widgets.BoxElement> {
  /** Adds or replaces a toast and returns the visible stack. */
  add(toast: ToastItem): readonly ToastItem[];

  /** Removes all toasts and returns the visible stack. */
  clear(): readonly ToastItem[];

  /** Removes one toast by id and returns the visible stack. */
  dismiss(id: string): readonly ToastItem[];

  /** Returns the visible stack. */
  items(): readonly ToastItem[];

  /** Removes expired toasts for a timestamp and returns the visible stack. */
  prune(now: number): readonly ToastItem[];
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

/** Creates a display-only Toast stack backed by a Blessed box. */
export function toast({ box, data: initialData = {}, parent }: ToastOptions): ToastHandle {
  let data = initialData;

  const state = createToastStackState(data);
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
  const style = createBoxStyleController(element, box);
  const render = (): void => {
    const {
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone,
      gap,
      markers,
      showMarker,
      theme,
      width: configuredWidth,
    } = data;
    const width = configuredWidth ?? innerDimension(element.width, element.iwidth);
    const content = renderToastStack({
      ...(gap === undefined ? {} : { gap }),
      ...(markers === undefined ? {} : { markers }),
      ...(showMarker === undefined ? {} : { showMarker }),
      toasts: state.list(),
      ...(width === undefined || width === 0 ? {} : { width }),
    });

    element.setContent(content);
    element.hidden = content.length === 0;
    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: foregroundTone ?? 'foreground',
      theme,
    });
  };

  render();
  element.on('resize', render);

  return {
    add(nextToast) {
      const items = state.add(nextToast);

      render();

      return items;
    },
    clear() {
      const items = state.clear();

      render();

      return items;
    },
    destroy() {
      element.off('resize', render);
      element.destroy();
    },
    dismiss(id) {
      const items = state.dismiss(id);

      render();

      return items;
    },
    element,
    items() {
      return state.list();
    },
    prune(now) {
      const items = state.prune(now);

      render();

      return items;
    },
    setData(nextData) {
      data = nextData;

      state.setOptions(nextData);

      render();
    },
  };
}
