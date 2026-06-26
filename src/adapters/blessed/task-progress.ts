import blessed from 'blessed';

import {
  STEP_INDICATOR_ASCII_MARKERS,
  STEP_INDICATOR_UNICODE_MARKERS,
} from '@/components/feedback/step-indicator/index.js';
import {
  type RenderTaskProgressOptions,
  renderTaskProgress,
  TASK_PROGRESS_ASCII_MARKERS,
  TASK_PROGRESS_UNICODE_MARKERS,
} from '@/components/feedback/task-progress/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import type { ThemeColors } from '@/core/theme.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the TaskProgress adapter. */
export type TaskProgressBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link taskProgress} adapter. */
export interface TaskProgressData
  extends Omit<RenderTaskProgressOptions, 'markers' | 'stepMarkers'>,
    Omit<BoxData, 'capabilities' | 'foregroundTone'> {
  /** Explicit terminal capabilities used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;

  /** Custom title markers. */
  markers?: RenderTaskProgressOptions['markers'];

  /** Custom step markers. */
  stepMarkers?: RenderTaskProgressOptions['stepMarkers'];

  /**
   * Semantic foreground token.
   *
   * @defaultValue `'foreground'`
   */
  tone?: keyof ThemeColors;
}

/** Options accepted by the Blessed {@link taskProgress} adapter. */
export interface TaskProgressOptions {
  /** Optional dimensions, position, style, and standard Blessed box settings. */
  box?: TaskProgressBoxOptions;

  /** Task content, state, capabilities, and theme data. */
  data: TaskProgressData;

  /** Blessed screen or node receiving the TaskProgress. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link taskProgress}. */
export type TaskProgressHandle = BlessedComponentHandle<
  TaskProgressData,
  blessed.Widgets.BoxElement
>;

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

/** Creates a display-only TaskProgress backed by a Blessed box. */
export function taskProgress({
  box,
  data: initialData,
  parent,
}: TaskProgressOptions): TaskProgressHandle {
  let data = initialData;

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
    const { backgroundTone, borderTone, capabilities: configuredCapabilities, theme, tone } = data;
    const capabilities = configuredCapabilities ?? detectCapabilities();
    const width = data.width ?? innerDimension(element.width, element.iwidth);
    const height = data.height ?? innerDimension(element.height, element.iheight);
    const markers =
      data.markers ??
      (capabilities.unicode ? TASK_PROGRESS_UNICODE_MARKERS : TASK_PROGRESS_ASCII_MARKERS);
    const stepMarkers =
      data.stepMarkers ??
      (capabilities.unicode ? STEP_INDICATOR_UNICODE_MARKERS : STEP_INDICATOR_ASCII_MARKERS);
    const characters =
      data.characters ??
      (capabilities.unicode ? { empty: '░', filled: '█' } : { empty: '-', filled: '#' });

    element.setContent(
      renderTaskProgress({
        ...data,
        characters,
        ...(height === undefined ? {} : { height }),
        markers,
        stepMarkers,
        ...(width === undefined || width === 0 ? {} : { width }),
      }),
    );
    style.apply({
      backgroundTone,
      borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: tone,
      theme,
    });
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
