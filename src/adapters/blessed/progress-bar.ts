import blessed from 'blessed';

import {
  type RenderProgressBarOptions,
  renderProgressBar,
} from '../../components/progress-bar/index.js';

export type ProgressBarBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

export interface ProgressBarOptions {
  box?: ProgressBarBoxOptions;
  data: RenderProgressBarOptions;
  parent: blessed.Widgets.Node;
}

export interface ProgressBarHandle {
  readonly element: blessed.Widgets.BoxElement;
  destroy(): void;
  setData(data: RenderProgressBarOptions): void;
}

export function progressBar({ box, data, parent }: ProgressBarOptions): ProgressBarHandle {
  const element = blessed.box({
    ...box,
    content: renderProgressBar(data),
    parent,
    tags: false,
  });

  return {
    element,
    destroy() {
      element.destroy();
    },
    setData(nextData) {
      element.setContent(renderProgressBar(nextData));
    },
  };
}
