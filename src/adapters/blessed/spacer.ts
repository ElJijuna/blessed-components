import blessed from 'blessed';

import {
  calculateSpacerLayout,
  type SpacerAxis,
  type SpacerCrossAxis,
  type SpacerSize,
} from '@/components/layout/spacer/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Spacer adapter. */
export type SpacerBoxOptions = BoxElementOptions;

/** Stateful layout and theme data accepted by {@link spacer}. */
export interface SpacerData extends BoxData {
  /** Main axis consumed by the spacer. @defaultValue `'vertical'` */
  axis?: SpacerAxis;

  /** Cross-axis behavior. @defaultValue `'stretch'` */
  crossAxis?: SpacerCrossAxis;

  /** Main-axis size. `fill` consumes the parent inner size. @defaultValue `'fill'` */
  size?: SpacerSize;
}

/** Options accepted by the Blessed {@link spacer} adapter. */
export interface SpacerOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: SpacerBoxOptions;

  /** Empty-space sizing and semantic theme data. */
  data?: SpacerData;

  /** Blessed screen or node receiving the Spacer. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link spacer}. */
export interface SpacerHandle
  extends BlessedComponentHandle<SpacerData, blessed.Widgets.BoxElement> {
  /** Recalculates dimensions from parent bounds and current data. */
  layout(): void;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

interface SizedParent extends blessed.Widgets.Node {
  height: blessed.Widgets.Types.TPosition;
  iheight?: blessed.Widgets.Types.TPosition;
  iwidth?: blessed.Widgets.Types.TPosition;
  width: blessed.Widgets.Types.TPosition;
}

function isSizedParent(parent: blessed.Widgets.Node): parent is SizedParent {
  return 'height' in parent && 'width' in parent;
}

function parentSize(parent: blessed.Widgets.Node): { height: number; width: number } {
  if (!isSizedParent(parent)) {
    return { height: 0, width: 0 };
  }

  return {
    height: Math.max(0, numericDimension(parent.height) - numericDimension(parent.iheight ?? 0)),
    width: Math.max(0, numericDimension(parent.width) - numericDimension(parent.iwidth ?? 0)),
  };
}

/**
 * Creates an empty themed Spacer backed by a Blessed box.
 *
 * Spacer owns no content. It sizes itself from its parent so fixed spacers can
 * participate in Stack/Cluster/Grid composition and flexible spacers can fill a
 * containing region.
 */
export function spacer({
  box: elementOptions,
  data: initialData = {},
  parent,
}: SpacerOptions): SpacerHandle {
  let data = initialData;

  const element = blessed.box({
    ...elementOptions,
    content: '',
    parent,
    style: {
      ...elementOptions?.style,
      border: { ...elementOptions?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, elementOptions);
  const layout = (): void => {
    const dimensions = parentSize(parent);
    const size = calculateSpacerLayout({
      ...(data.axis === undefined ? {} : { axis: data.axis }),
      ...(data.crossAxis === undefined ? {} : { crossAxis: data.crossAxis }),
      height: dimensions.height,
      ...(data.size === undefined ? {} : { size: data.size }),
      width: dimensions.width,
    });

    element.width = size.width;
    element.height = size.height;
  };
  const render = (): void => {
    style.apply(data);
    layout();
  };

  render();
  parent.on('resize', layout);

  return {
    destroy() {
      parent.removeListener('resize', layout);
      element.destroy();
    },
    element,
    layout,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
