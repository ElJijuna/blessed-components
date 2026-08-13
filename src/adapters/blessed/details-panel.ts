import blessed from 'blessed';
import {
  calculateDetailsPanelLayout,
  type DetailsPanelMode,
} from '@/components/layout/details-panel/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

export type DetailsPanelBoxOptions = BoxElementOptions;
export type DetailsPanelRegionOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export interface DetailsPanelData extends BoxData {
  collapseBelow?: number;
  detailContent?: string;
  gap?: number;
  masterContent?: string;
  masterWidth?: number;
  /** Called when the narrow detail view requests a return to the master. */ onBack?: () => void;
  /** Stable selected item id; absence displays the narrow master view. */ selectedId?: string;
}
export interface DetailsPanelOptions {
  box?: DetailsPanelBoxOptions;
  data?: DetailsPanelData;
  detail?: DetailsPanelRegionOptions;
  master?: DetailsPanelRegionOptions;
  parent: blessed.Widgets.Node;
}
export interface DetailsPanelHandle
  extends BlessedComponentHandle<DetailsPanelData, blessed.Widgets.BoxElement> {
  back(): boolean;
  readonly detail: blessed.Widgets.BoxElement;
  layout(): void;
  readonly master: blessed.Widgets.BoxElement;
  mode(): DetailsPanelMode;
}

function dimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a responsive master-detail container backed by Blessed boxes. */
export function detailsPanel({
  box,
  data: initialData = {},
  detail: detailOptions,
  master: masterOptions,
  parent,
}: DetailsPanelOptions): DetailsPanelHandle {
  let data = initialData;
  let currentMode: DetailsPanelMode = 'master-only';

  const element = blessed.box({
    ...box,
    content: '',
    keys: true,
    parent,
    style: { ...box?.style, border: { ...box?.style?.border } },
    tags: false,
  });
  const master = blessed.box({ ...masterOptions, content: '', parent: element, tags: false });
  const detail = blessed.box({ ...detailOptions, content: '', parent: element, tags: false });
  const style = createBoxStyleController(element, box, {}, { component: 'details-panel' });
  const layout = () => {
    const positions = calculateDetailsPanelLayout({
      ...(data.collapseBelow === undefined ? {} : { collapseBelow: data.collapseBelow }),
      ...(data.gap === undefined ? {} : { gap: data.gap }),
      height: Math.max(0, dimension(element.height) - dimension(element.iheight)),
      ...(data.masterWidth === undefined ? {} : { masterWidth: data.masterWidth }),
      selected: data.selectedId !== undefined,
      width: Math.max(0, dimension(element.width) - dimension(element.iwidth)),
    });

    currentMode = positions.mode;

    for (const [node, region, visible] of [
      [master, positions.master, positions.masterVisible],
      [detail, positions.detail, positions.detailVisible],
    ] as const) {
      node.left = region.x;
      node.top = region.y;
      node.width = region.width;
      node.height = region.height;
      node.hidden = !visible;
    }
  };
  const render = () => {
    style.apply({
      backgroundTone: data.backgroundTone,
      borderTone: data.borderTone,
      capabilities: data.capabilities,
      theme: data.theme,
    });
    layout();

    if (data.masterContent !== undefined) {
      master.setContent(data.masterContent);
    }

    if (data.detailContent !== undefined) {
      detail.setContent(data.detailContent);
    }
  };
  const back = () => {
    if (data.selectedId === undefined) {
      return false;
    }

    data.onBack?.();

    return true;
  };

  render();
  element.on('resize', render);
  element.on('keypress', (_character: string, key: { name?: string }) => {
    if (key.name === 'escape' || key.name === 'backspace') {
      back();
    }
  });

  return {
    back,
    destroy: () => element.destroy(),
    detail,
    element,
    layout,
    master,
    mode: () => currentMode,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
