import blessed from 'blessed';

import {
  type CollapsibleCharacters,
  calculateCollapsibleLayout,
  renderCollapsibleHeader,
} from '@/components/layout/collapsible/index.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Collapsible root. */
export type CollapsibleBoxOptions = BoxElementOptions;

/** Blessed options supported by the Collapsible header. */
export type CollapsibleHeaderOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'height' | 'keys' | 'mouse' | 'parent' | 'tags' | 'top'
>;

/** Blessed options supported by the Collapsible body. */
export type CollapsibleBodyOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'height' | 'parent' | 'tags' | 'top'
>;

/** Stateful data accepted by the Blessed {@link collapsible} adapter. */
export interface CollapsibleData extends BoxData {
  /** Body height while expanded. @defaultValue remaining root height */
  bodyHeight?: number;

  /** Character tokens used by the header renderer. */
  characters?: CollapsibleCharacters;

  /** Plain text body content managed by the adapter. */
  content?: string;

  /** Initial expanded state for uncontrolled usage. */
  defaultExpanded?: boolean;

  /** Whether focus and toggling are unavailable. */
  disabled?: boolean;

  /** Controlled expanded state. */
  expanded?: boolean;

  /** Empty rows between header and body while expanded. @defaultValue `0` */
  gap?: number;

  /** Semantic header foreground token. */
  headerTone?: keyof ThemeColors;

  /** Called after keyboard, mouse, or imperative toggling requests a state change. */
  onExpandedChange?: (expanded: boolean) => void;

  /** Non-empty, single-line title rendered in the header. */
  title: string;
}

/** Options accepted by the Blessed {@link collapsible} adapter. */
export interface CollapsibleOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: CollapsibleBoxOptions;

  /** Optional header element settings. */
  header?: CollapsibleHeaderOptions;

  /** Optional body element settings. */
  body?: CollapsibleBodyOptions;

  /** Title, state, body content, callback, and semantic theme data. */
  data: CollapsibleData;

  /** Blessed screen or node receiving the Collapsible root. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link collapsible}. */
export interface CollapsibleHandle
  extends BlessedComponentHandle<CollapsibleData, blessed.Widgets.BoxElement> {
  /** Body element where callers can append child widgets that survive collapse. */
  readonly body: blessed.Widgets.BoxElement;

  /** Returns the current controlled or uncontrolled expanded state. */
  expanded(): boolean;

  /** Gives terminal focus to an enabled header. */
  focus(): void;

  /** Header element that receives keyboard and mouse toggle interaction. */
  readonly header: blessed.Widgets.BoxElement;

  /** Sets an enabled expanded state and reports whether setting occurred. */
  setExpanded(expanded: boolean): boolean;

  /** Toggles an enabled body region and reports whether toggling occurred. */
  toggle(): boolean;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function removeFrom(
  elements: blessed.Widgets.BlessedElement[],
  element: blessed.Widgets.BoxElement,
) {
  const index = elements.indexOf(element);

  if (index >= 0) {
    elements.splice(index, 1);
  }
}

/** Creates a Collapsible container backed by Blessed boxes. */
export function collapsible({
  body: bodyOptions,
  box: rootOptions,
  data: initialData,
  header: headerOptions,
  parent,
}: CollapsibleOptions): CollapsibleHandle {
  let data = initialData;
  let focused = false;
  let uncontrolledExpanded = initialData.defaultExpanded ?? false;

  const element = blessed.box({
    ...rootOptions,
    content: '',
    parent,
    style: {
      ...rootOptions?.style,
      border: { ...rootOptions?.style?.border },
    },
    tags: false,
  });
  const header = blessed.box({
    ...headerOptions,
    content: '',
    height: 1,
    keys: true,
    mouse: true,
    parent: element,
    tags: false,
    top: 0,
  });
  const body = blessed.box({
    ...bodyOptions,
    content: '',
    parent: element,
    tags: false,
  });
  const style = createBoxStyleController(element, rootOptions);
  const isControlled = (): boolean => Object.hasOwn(data, 'expanded');
  const currentExpanded = (): boolean =>
    isControlled() ? (data.expanded ?? false) : uncontrolledExpanded;
  const width = (): number =>
    Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const resolvedBodyHeight = (): number => {
    if (data.bodyHeight !== undefined) {
      return data.bodyHeight;
    }

    return Math.max(0, numericDimension(element.height) - numericDimension(element.iheight) - 1);
  };
  const render = (): void => {
    const { backgroundTone, borderTone, capabilities, content, headerTone, theme } = data;

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      foregroundTone: headerTone,
      theme,
    });
    header.setContent(
      renderCollapsibleHeader({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        disabled: data.disabled === true,
        expanded: currentExpanded(),
        focused,
        title: data.title,
        width: width(),
      }),
    );

    if (content !== undefined) {
      body.setContent(content);
    }

    const layout = calculateCollapsibleLayout({
      bodyHeight: resolvedBodyHeight(),
      expanded: currentExpanded(),
      ...(data.gap === undefined ? {} : { gap: data.gap }),
    });

    header.height = layout.headerHeight;
    body.top = layout.bodyTop;
    body.height = layout.bodyHeight;
    body.hidden = !layout.bodyVisible;
  };
  const syncInteraction = (): void => {
    if (data.disabled === true) {
      removeFrom(header.screen.clickable, header);
      removeFrom(header.screen.keyable, header);

      return;
    }

    header.enableInput();
  };
  const commitExpanded = (expanded: boolean): boolean => {
    if (data.disabled === true) {
      return false;
    }

    if (!isControlled()) {
      uncontrolledExpanded = expanded;
    }

    data.onExpandedChange?.(expanded);
    render();

    return true;
  };
  const handle: CollapsibleHandle = {
    body,
    destroy() {
      element.destroy();
    },
    element,
    expanded: currentExpanded,
    focus() {
      if (data.disabled !== true) {
        header.focus();
      }
    },
    header,
    setData(nextData) {
      data = nextData;

      if (!isControlled() && nextData.defaultExpanded !== undefined) {
        uncontrolledExpanded = nextData.defaultExpanded;
      }

      syncInteraction();
      render();
    },
    setExpanded: commitExpanded,
    toggle() {
      return commitExpanded(!currentExpanded());
    },
  };

  header.on('blur', () => {
    focused = false;
    render();
  });
  header.on('click', () => {
    handle.toggle();
  });
  header.on('focus', () => {
    focused = true;
    render();
  });
  header.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'enter':
      case 'space':
        handle.toggle();
        break;
    }
  });
  element.on('resize', render);

  syncInteraction();
  render();

  return handle;
}
