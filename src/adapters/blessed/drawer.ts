import blessed from 'blessed';

import {
  type CreateDrawerStateOptions,
  type DrawerEdge,
  type RenderDrawerRegionOptions,
  renderDrawerRegion,
} from '@/components/overlays/drawer/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import { dialogRoot } from './dialog.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by Drawer parts. */
export type DrawerBoxOptions = BoxElementOptions;

/** Stateful data accepted by {@link drawerRoot}. */
export interface DrawerRootData extends BoxData, CreateDrawerStateOptions {
  /** Whether Escape requests closing. @defaultValue `true` */
  dismissOnEscape?: boolean;

  /** Stable overlay identifier. */
  id: string;

  /** Preferred registered focus identifier when opening. */
  initialFocusId?: string;

  /** Whether this Drawer blocks lower overlay layers. @defaultValue `true` */
  modal?: boolean;
}

/** Options accepted by {@link drawerRoot}. */
export interface DrawerRootOptions {
  /** Full-screen layer position, style, and standard Blessed settings. */
  box?: DrawerBoxOptions;

  /** Identity, state, focus, dismissal, and theme configuration. */
  data: DrawerRootData;

  /** Blessed screen or node receiving the Drawer layer. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link drawerRoot}. */
export interface DrawerRootHandle
  extends BlessedComponentHandle<DrawerRootData, blessed.Widgets.BoxElement> {
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

/** Stateful content and theme data shared by Drawer visual regions. */
export interface DrawerRegionData
  extends RenderDrawerRegionOptions,
    Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. */
  tone?: keyof ThemeColors;
}

/** Data accepted by {@link drawerContent}. */
export interface DrawerContentData extends DrawerRegionData {
  /** Edge the panel is attached to. @defaultValue `'right'` */
  edge?: DrawerEdge;

  /** Width for left/right drawers, height for top/bottom drawers. @defaultValue `'35%'` */
  size?: blessed.Widgets.Types.TPosition;
}

/** Options for Drawer content. */
export interface DrawerContentOptions {
  /** Position, dimensions, style, and standard Blessed settings. */
  box?: DrawerBoxOptions;

  /** Edge, size, safe text, overflow, alignment, and semantic theme configuration. */
  data?: DrawerContentData;

  /** Drawer root or other node receiving this panel. */
  parent: blessed.Widgets.Node;
}

/** Options shared by Drawer visual regions. */
export interface DrawerRegionOptions {
  /** Position, dimensions, style, and standard Blessed settings. */
  box?: DrawerBoxOptions;

  /** Safe text, overflow, alignment, and semantic theme configuration. */
  data?: DrawerRegionData;

  /** Drawer root, content, or other node receiving this region. */
  parent: blessed.Widgets.Node;
}

export type DrawerHeaderOptions = DrawerRegionOptions;
export type DrawerBodyOptions = DrawerRegionOptions;
export type DrawerFooterOptions = DrawerRegionOptions;

export type DrawerContentHandle = BlessedComponentHandle<
  DrawerContentData,
  blessed.Widgets.BoxElement
>;
export type DrawerRegionHandle = BlessedComponentHandle<
  DrawerRegionData,
  blessed.Widgets.BoxElement
>;
export type DrawerHeaderHandle = DrawerRegionHandle;
export type DrawerBodyHandle = DrawerRegionHandle;
export type DrawerFooterHandle = DrawerRegionHandle;

interface DrawerRegionDefaults {
  bold?: boolean;
  box: DrawerBoxOptions;
  overflow: NonNullable<RenderDrawerRegionOptions['overflow']>;
  theme: BoxData;
  tone: keyof ThemeColors;
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

function contentBox(edge: DrawerEdge, size: blessed.Widgets.Types.TPosition): DrawerBoxOptions {
  if (edge === 'left') {
    return { bottom: 0, left: 0, top: 0, width: size };
  }

  if (edge === 'right') {
    return { bottom: 0, right: 0, top: 0, width: size };
  }

  if (edge === 'top') {
    return { height: size, left: 0, right: 0, top: 0 };
  }

  return { bottom: 0, height: size, left: 0, right: 0 };
}

function contentSize(
  edge: DrawerEdge,
  dataSize: blessed.Widgets.Types.TPosition | undefined,
  box: DrawerBoxOptions | undefined,
): blessed.Widgets.Types.TPosition {
  if (dataSize !== undefined) {
    return dataSize;
  }

  if (edge === 'left' || edge === 'right') {
    return box?.width ?? '35%';
  }

  return box?.height ?? '35%';
}

function createDrawerRegion(
  { box, data: initialData = {}, parent }: DrawerRegionOptions,
  defaults: DrawerRegionDefaults,
): DrawerRegionHandle {
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
      renderDrawerRegion({
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

/** Creates a modal Drawer layer with controlled/uncontrolled state and focus. */
export function drawerRoot({
  box,
  data: initialData,
  parent,
}: DrawerRootOptions): DrawerRootHandle {
  let data = initialData;

  const root = dialogRoot({
    ...(box === undefined ? {} : { box }),
    data,
    parent,
  });
  const handle: DrawerRootHandle = {
    close: () => root.close(),
    destroy() {
      root.destroy();
    },
    element: root.element,
    get isOpen() {
      return root.isOpen;
    },
    open: () => root.open(),
    registerFocusable: (id, element) => root.registerFocusable(id, element),
    setData(nextData) {
      data = nextData;
      root.setData(data);
    },
    toggle: () => root.toggle(),
    unregisterFocusable: (id) => root.unregisterFocusable(id),
  };

  return handle;
}

/** Creates edge-attached bordered Drawer content. */
export function drawerContent({
  box,
  data: initialData = {},
  parent,
}: DrawerContentOptions): DrawerContentHandle {
  let data = initialData;

  const edge = data.edge ?? 'right';
  const size = contentSize(edge, data.size, box);
  const defaults: DrawerRegionDefaults = {
    box: {
      border: 'line',
      padding: { left: 1, right: 1 },
      ...contentBox(edge, size),
    },
    overflow: 'clip',
    theme: {
      backgroundTone: 'background',
      borderTone: 'border',
    },
    tone: 'foreground',
  };
  const region = createDrawerRegion(
    {
      box: {
        ...defaults.box,
        ...box,
      },
      data,
      parent,
    },
    defaults,
  );
  const applyLayout = (): void => {
    const nextEdge = data.edge ?? 'right';
    const nextBox = contentBox(nextEdge, contentSize(nextEdge, data.size, box));

    for (const property of ['left', 'right', 'top', 'bottom', 'width', 'height'] as const) {
      region.element[property] = nextBox[property] ?? box?.[property];
    }
  };

  applyLayout();

  return {
    destroy() {
      region.destroy();
    },
    element: region.element,
    setData(nextData) {
      data = nextData;
      applyLayout();
      region.setData(data);
      region.element.emitDescendants('resize');
    },
  };
}

/** Creates Drawer header text. */
export function drawerHeader(options: DrawerHeaderOptions): DrawerHeaderHandle {
  return createDrawerRegion(options, {
    bold: true,
    box: { height: 1, left: 0, right: 0, top: 0 },
    overflow: 'truncate',
    theme: {},
    tone: 'foreground',
  });
}

/** Creates Drawer main body region. */
export function drawerBody(options: DrawerBodyOptions): DrawerBodyHandle {
  return createDrawerRegion(options, {
    box: { bottom: 1, left: 0, right: 0, top: 1 },
    overflow: 'wrap',
    theme: {},
    tone: 'foreground',
  });
}

/** Creates Drawer footer region. */
export function drawerFooter(options: DrawerFooterOptions): DrawerFooterHandle {
  return createDrawerRegion(options, {
    box: { bottom: 0, height: 1, left: 0, right: 0 },
    overflow: 'truncate',
    theme: {},
    tone: 'muted',
  });
}
