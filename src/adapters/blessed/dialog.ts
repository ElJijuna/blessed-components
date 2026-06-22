import blessed from 'blessed';

import {
  type CreateDialogStateOptions,
  createDialogState,
  type RenderDialogRegionOptions,
  renderDialogRegion,
} from '@/components/overlays/dialog/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { createFocusScope, type FocusScopeModel } from '@/primitives/focus-scope/index.js';
import { createOverlayStack, type OverlayStackModel } from '@/primitives/overlay/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

const screenOverlays = new WeakMap<blessed.Widgets.Screen, OverlayStackModel>();

/** Blessed options supported by Dialog parts. */
export type DialogBoxOptions = BoxElementOptions;

/** Stateful data accepted by {@link dialogRoot}. */
export interface DialogRootData extends BoxData, CreateDialogStateOptions {
  /** Whether Escape requests closing. @defaultValue `true` */
  dismissOnEscape?: boolean;

  /** Stable overlay identifier. */
  id: string;

  /** Preferred registered focus identifier when opening. */
  initialFocusId?: string;

  /** Whether this Dialog blocks lower overlay layers. @defaultValue `true` */
  modal?: boolean;
}

/** Options accepted by {@link dialogRoot}. */
export interface DialogRootOptions {
  /** Full-screen layer position, style, and standard Blessed settings. */
  box?: DialogBoxOptions;

  /** Identity, state, focus, dismissal, and theme configuration. */
  data: DialogRootData;

  /** Blessed screen or node receiving the Dialog layer. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link dialogRoot}. */
export interface DialogRootHandle
  extends BlessedComponentHandle<DialogRootData, blessed.Widgets.BoxElement> {
  /** Current controlled or uncontrolled open state. */
  readonly isOpen: boolean;

  /** Requests closing. */
  close(): boolean;

  /** Requests opening. */
  open(): boolean;

  /** Registers one focusable element in Tab order. */
  registerFocusable(id: string, element: blessed.Widgets.BlessedElement): void;

  /** Requests opposite open state. */
  toggle(): boolean;

  /** Removes one element from managed Tab order. */
  unregisterFocusable(id: string): void;
}

/** Stateful content and theme data shared by Dialog visual regions. */
export interface DialogRegionData
  extends RenderDialogRegionOptions,
    Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. */
  tone?: keyof ThemeColors;
}

/** Options shared by Dialog visual regions. */
export interface DialogRegionOptions {
  /** Position, dimensions, style, and standard Blessed settings. */
  box?: DialogBoxOptions;

  /** Safe text, overflow, alignment, and semantic theme configuration. */
  data?: DialogRegionData;

  /** Dialog root, content, or other node receiving this region. */
  parent: blessed.Widgets.Node;
}

/** Handle returned by Dialog visual regions. */
export type DialogRegionHandle = BlessedComponentHandle<
  DialogRegionData,
  blessed.Widgets.BoxElement
>;

export type DialogContentOptions = DialogRegionOptions;
export type DialogTitleOptions = DialogRegionOptions;
export type DialogDescriptionOptions = DialogRegionOptions;
export type DialogBodyOptions = DialogRegionOptions;
export type DialogFooterOptions = DialogRegionOptions;

export type DialogContentHandle = DialogRegionHandle;
export type DialogTitleHandle = DialogRegionHandle;
export type DialogDescriptionHandle = DialogRegionHandle;
export type DialogBodyHandle = DialogRegionHandle;
export type DialogFooterHandle = DialogRegionHandle;

interface DialogRegionDefaults {
  bold?: boolean;
  box: DialogBoxOptions;
  overflow: NonNullable<RenderDialogRegionOptions['overflow']>;
  theme: BoxData;
  tone: keyof ThemeColors;
}

interface Keypress {
  full?: string;
  name?: string;
  shift?: boolean;
}

function overlayStack(screen: blessed.Widgets.Screen): OverlayStackModel {
  const existing = screenOverlays.get(screen);

  if (existing !== undefined) {
    return existing;
  }

  const created = createOverlayStack();

  screenOverlays.set(screen, created);

  return created;
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

function createDialogRegion(
  { box, data: initialData = {}, parent }: DialogRegionOptions,
  defaults: DialogRegionDefaults,
): DialogRegionHandle {
  let data = initialData;

  const explicitBold = box?.style?.bold;
  const element = blessed.box({
    ...defaults.box,
    ...box,
    content: '',
    parent,
    style: {
      ...(defaults.bold === undefined ? {} : { bold: defaults.bold }),
      ...box?.style,
      border: { ...box?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, box, {
    ...defaults.theme,
    foregroundTone: defaults.tone,
  });
  const render = (): void => {
    const { backgroundTone, borderTone, capabilities, theme, tone, ...renderData } = data;
    const width = renderData.width ?? innerDimension(element.width, element.iwidth);
    const height = renderData.height ?? innerDimension(element.height, element.iheight);

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: tone,
      theme,
    });
    element.style.bold = explicitBold ?? defaults.bold;

    if (width === 0 || height === 0) {
      element.setContent('');

      return;
    }

    element.setContent(
      renderDialogRegion({
        ...renderData,
        ...(height === undefined ? {} : { height }),
        overflow: renderData.overflow ?? defaults.overflow,
        ...(width === undefined ? {} : { width }),
      }),
    );
  };

  render();
  element.on('resize', render);

  return {
    destroy() {
      element.destroy();
    },
    element,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}

/**
 * Creates a modal Dialog layer with controlled/uncontrolled state and focus.
 *
 * Dialog owns one global screen key listener. It traps Tab among registered
 * elements, handles Escape only while topmost, restores previous focus, and
 * removes all listeners on destroy.
 */
export function dialogRoot({
  box,
  data: initialData,
  parent,
}: DialogRootOptions): DialogRootHandle {
  let data = initialData;
  let active = false;
  let destroyed = false;
  let previousFocus: blessed.Widgets.BlessedElement | undefined;

  const { screen } = parent;
  const overlays = overlayStack(screen);
  const focusables = new Map<string, blessed.Widgets.BlessedElement>();
  const state = createDialogState(initialData);
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
  });

  let focusScope: FocusScopeModel = createFocusScope({ items: [] });

  const rebuildFocusScope = (): void => {
    const currentId = focusScope.current();
    const shouldUseInitialFocus =
      active &&
      screen.focused === element &&
      data.initialFocusId !== undefined &&
      focusables.has(data.initialFocusId);

    focusScope = createFocusScope({
      ...(data.initialFocusId === undefined ? {} : { initialFocusId: data.initialFocusId }),
      items: [...focusables.keys()].map((id) => ({ id })),
    });

    if (active) {
      focusScope.activate();

      if (!shouldUseInitialFocus && currentId !== undefined) {
        focusScope.focus(currentId);
      }
    }
  };
  const focusId = (id: string | undefined): void => {
    const target = id === undefined ? undefined : focusables.get(id);

    if (target === undefined) {
      element.focus();
    } else {
      target.focus();
    }
  };
  const activate = (): void => {
    if (active || destroyed) {
      return;
    }

    previousFocus = screen.focused;
    overlays.open({
      dismissOnEscape: data.dismissOnEscape ?? true,
      id: data.id,
      modal: data.modal ?? true,
    });
    active = true;
    element.show();
    element.setFront();
    element.emitDescendants('resize');
    focusScope.activate();
    focusId(focusScope.current());
  };
  const deactivate = (): void => {
    if (!active) {
      return;
    }

    overlays.close(data.id);
    active = false;
    focusScope.deactivate();
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
  const handle: DialogRootHandle = {
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
    get isOpen() {
      return state.isOpen();
    },
    open() {
      state.open();
      sync();

      return state.isOpen();
    },
    registerFocusable(id, focusable) {
      if (focusables.has(id)) {
        throw new RangeError(`Dialog focusable id "${id}" is already registered.`);
      }

      focusables.set(id, focusable);
      rebuildFocusScope();

      if (
        active &&
        screen.focused === element &&
        (data.initialFocusId === undefined || focusables.has(data.initialFocusId))
      ) {
        focusId(focusScope.current());
      }
    },
    setData(nextData) {
      const previousId = data.id;

      if (active && nextData.id !== previousId) {
        throw new RangeError('Open Dialog id cannot change.');
      }

      data = nextData;
      state.setOptions(nextData);
      rebuildFocusScope();
      sync();
    },
    toggle() {
      state.toggle();
      sync();

      return state.isOpen();
    },
    unregisterFocusable(id) {
      const removed = focusables.get(id);

      focusables.delete(id);
      rebuildFocusScope();

      if (active && removed !== undefined && screen.focused === removed) {
        focusId(focusScope.current());
      }
    },
  };
  const onKeypress = (_character: string, key: Keypress): void => {
    if (!active || overlays.top()?.id !== data.id) {
      return;
    }

    const keyName = key.full ?? key.name;

    if (keyName === 'escape' && (data.dismissOnEscape ?? true)) {
      handle.close();

      return;
    }

    if (keyName === 'tab') {
      focusId(key.shift === true ? focusScope.previous() : focusScope.next());
    } else if (keyName === 'S-tab') {
      focusId(focusScope.previous());
    }
  };

  screen.on('keypress', onKeypress);
  sync();

  return handle;
}

/** Creates centered bordered Dialog content. */
export function dialogContent(options: DialogContentOptions): DialogContentHandle {
  return createDialogRegion(options, {
    box: {
      border: 'line',
      height: '60%',
      left: 'center',
      padding: { left: 1, right: 1 },
      top: 'center',
      width: '70%',
    },
    overflow: 'clip',
    theme: {
      backgroundTone: 'background',
      borderTone: 'border',
    },
    tone: 'foreground',
  });
}

/** Creates Dialog title text. */
export function dialogTitle(options: DialogTitleOptions): DialogTitleHandle {
  return createDialogRegion(options, {
    bold: true,
    box: { height: 1, left: 0, right: 0, top: 0 },
    overflow: 'truncate',
    theme: {},
    tone: 'foreground',
  });
}

/** Creates Dialog supporting description text. */
export function dialogDescription(options: DialogDescriptionOptions): DialogDescriptionHandle {
  return createDialogRegion(options, {
    box: { height: 1, left: 0, right: 0, top: 1 },
    overflow: 'truncate',
    theme: {},
    tone: 'muted',
  });
}

/** Creates Dialog main body region. */
export function dialogBody(options: DialogBodyOptions): DialogBodyHandle {
  return createDialogRegion(options, {
    box: { bottom: 1, left: 0, right: 0, top: 2 },
    overflow: 'wrap',
    theme: {},
    tone: 'foreground',
  });
}

/** Creates Dialog footer region. */
export function dialogFooter(options: DialogFooterOptions): DialogFooterHandle {
  return createDialogRegion(options, {
    box: { bottom: 0, height: 1, left: 0, right: 0 },
    overflow: 'truncate',
    theme: {},
    tone: 'muted',
  });
}
