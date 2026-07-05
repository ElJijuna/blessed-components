import blessed from 'blessed';

import { calculatePageLayout, renderPageHeader } from '@/components/layout/page/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Page root. */
export type PageBoxOptions = BoxElementOptions;

/** Blessed options supported by Page regions. */
export type PageRegionOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link page} adapter. */
export interface PageData extends BoxData {
  /** Optional right-aligned header command or status text. */
  actions?: string;

  /** Main body text managed by the adapter. */
  content?: string;

  /** Empty rows between header/body/footer regions. @defaultValue `0` */
  gap?: number;

  /** Footer text managed by the adapter. */
  footer?: string;

  /** Footer height in terminal rows. @defaultValue `0` when footer is empty, otherwise `1` */
  footerHeight?: number;

  /** Header height in terminal rows. @defaultValue `1` */
  headerHeight?: number;

  /** Optional supporting title text. */
  subtitle?: string;

  /** Non-empty page title. */
  title: string;
}

/** Options accepted by the Blessed {@link page} adapter. */
export interface PageOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: PageBoxOptions;

  /** Optional body element settings. */
  body?: PageRegionOptions;

  /** Title, footer, layout, and semantic theme data. */
  data: PageData;

  /** Optional footer element settings. */
  footer?: PageRegionOptions;

  /** Optional header element settings. */
  header?: PageRegionOptions;

  /** Blessed screen or node receiving the Page root. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link page}. */
export interface PageHandle extends BlessedComponentHandle<PageData, blessed.Widgets.BoxElement> {
  /** Main body element where callers can append child widgets. */
  readonly body: blessed.Widgets.BoxElement;

  /** Footer element. */
  readonly footer: blessed.Widgets.BoxElement;

  /** Header element. */
  readonly header: blessed.Widgets.BoxElement;

  /** Recalculates region positions for the current root size. */
  layout(): void;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a Page container backed by Blessed boxes. */
export function page({
  body: bodyOptions,
  box: rootOptions,
  data: initialData,
  footer: footerOptions,
  header: headerOptions,
  parent,
}: PageOptions): PageHandle {
  let data = initialData;

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
    parent: element,
    tags: false,
  });
  const body = blessed.box({
    ...bodyOptions,
    content: '',
    parent: element,
    tags: false,
  });
  const footer = blessed.box({
    ...footerOptions,
    content: '',
    parent: element,
    tags: false,
  });
  const style = createBoxStyleController(element, rootOptions);
  const width = (): number =>
    Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const height = (): number =>
    Math.max(0, numericDimension(element.height) - numericDimension(element.iheight));
  const layout = (): void => {
    const footerHeight =
      data.footerHeight ?? (data.footer === undefined || data.footer.length === 0 ? 0 : 1);
    const positions = calculatePageLayout({
      footerHeight,
      ...(data.gap === undefined ? {} : { gap: data.gap }),
      ...(data.headerHeight === undefined ? {} : { headerHeight: data.headerHeight }),
      height: height(),
      width: width(),
    });

    header.left = positions.header.x;
    header.top = positions.header.y;
    header.width = positions.header.width;
    header.height = positions.header.height;
    body.left = positions.body.x;
    body.top = positions.body.y;
    body.width = positions.body.width;
    body.height = positions.body.height;
    footer.left = positions.footer.x;
    footer.top = positions.footer.y;
    footer.width = positions.footer.width;
    footer.height = positions.footer.height;
    footer.hidden = positions.footer.height === 0;
  };
  const render = (): void => {
    const { backgroundTone, borderTone, capabilities, content, footer: footerText, theme } = data;

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      theme,
    });
    layout();
    header.setContent(
      renderPageHeader({
        ...(data.actions === undefined ? {} : { actions: data.actions }),
        ...(data.subtitle === undefined ? {} : { subtitle: data.subtitle }),
        title: data.title,
        width: width(),
      }),
    );

    if (content !== undefined) {
      body.setContent(content);
    }

    footer.setContent(footerText ?? '');
  };

  render();
  element.on('resize', render);

  return {
    body,
    destroy() {
      element.destroy();
    },
    element,
    footer,
    header,
    layout,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
