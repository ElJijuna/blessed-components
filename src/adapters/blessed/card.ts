import blessed from 'blessed';

import {
  type RenderCardRegionOptions,
  renderCardRegion,
} from '../../components/layout/card/index.js';
import type { ThemeColors } from '../../core/theme.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by Card parts.
 *
 * `parent`, `content`, and `tags` are managed by Card adapters.
 */
export type CardBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Theme data accepted by {@link cardRoot}. */
export type CardRootData = BoxData;

/** Options accepted by {@link cardRoot}. */
export interface CardRootOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: CardBoxOptions;

  /** Theme configuration for the root frame. */
  data?: CardRootData;

  /** Blessed screen or node receiving the card. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link cardRoot}. */
export type CardRootHandle = BlessedComponentHandle<CardRootData, blessed.Widgets.BoxElement>;

/** Stateful content and theme data shared by Card regions. */
export interface CardRegionData extends RenderCardRegionOptions, Omit<BoxData, 'foregroundTone'> {
  /** Semantic foreground token. */
  tone?: keyof ThemeColors;
}

/** Options shared by named Card region adapters. */
export interface CardRegionOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: CardBoxOptions;

  /** Safe text and semantic theme configuration. */
  data?: CardRegionData;

  /** Card root, region, or other Blessed node receiving this region. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by named Card region adapters. */
export type CardRegionHandle = BlessedComponentHandle<CardRegionData, blessed.Widgets.BoxElement>;

/** Options accepted by {@link cardHeader}. */
export type CardHeaderOptions = CardRegionOptions;

/** Options accepted by {@link cardTitle}. */
export type CardTitleOptions = CardRegionOptions;

/** Options accepted by {@link cardDescription}. */
export type CardDescriptionOptions = CardRegionOptions;

/** Options accepted by {@link cardBody}. */
export type CardBodyOptions = CardRegionOptions;

/** Options accepted by {@link cardFooter}. */
export type CardFooterOptions = CardRegionOptions;

/** Handle returned by {@link cardHeader}. */
export type CardHeaderHandle = CardRegionHandle;

/** Handle returned by {@link cardTitle}. */
export type CardTitleHandle = CardRegionHandle;

/** Handle returned by {@link cardDescription}. */
export type CardDescriptionHandle = CardRegionHandle;

/** Handle returned by {@link cardBody}. */
export type CardBodyHandle = CardRegionHandle;

/** Handle returned by {@link cardFooter}. */
export type CardFooterHandle = CardRegionHandle;

interface CardRegionDefaults {
  bold?: boolean;
  box: CardBoxOptions;
  overflow: NonNullable<RenderCardRegionOptions['overflow']>;
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

function createCardRegion(
  { box, data: initialData = {}, parent }: CardRegionOptions,
  defaults: CardRegionDefaults,
): CardRegionHandle {
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
      renderCardRegion({
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
 * Creates the framed root container for a composable Card.
 *
 * Child Card regions should receive `handle.element` as their parent.
 */
export function cardRoot({ box, data: initialData = {}, parent }: CardRootOptions): CardRootHandle {
  let data = initialData;

  const element = blessed.box({
    bottom: 0,
    border: 'line',
    left: 0,
    padding: { left: 1, right: 1 },
    right: 0,
    top: 0,
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
  const render = (): void => style.apply(data);

  render();

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

/** Creates Card header container. */
export function cardHeader(options: CardHeaderOptions): CardHeaderHandle {
  return createCardRegion(options, {
    box: { height: 2, left: 0, right: 0, top: 0 },
    overflow: 'clip',
    tone: 'foreground',
  });
}

/** Creates Card title text. */
export function cardTitle(options: CardTitleOptions): CardTitleHandle {
  return createCardRegion(options, {
    bold: true,
    box: { height: 1, left: 0, right: 0, top: 0 },
    overflow: 'truncate',
    tone: 'foreground',
  });
}

/** Creates Card supporting description text. */
export function cardDescription(options: CardDescriptionOptions): CardDescriptionHandle {
  return createCardRegion(options, {
    box: { height: 1, left: 0, right: 0, top: 1 },
    overflow: 'truncate',
    tone: 'muted',
  });
}

/** Creates Card main content region. */
export function cardBody(options: CardBodyOptions): CardBodyHandle {
  return createCardRegion(options, {
    box: { bottom: 1, left: 0, right: 0, top: 2 },
    overflow: 'wrap',
    tone: 'foreground',
  });
}

/** Creates Card footer region. */
export function cardFooter(options: CardFooterOptions): CardFooterHandle {
  return createCardRegion(options, {
    box: { bottom: 0, height: 1, left: 0, right: 0 },
    overflow: 'truncate',
    tone: 'muted',
  });
}
