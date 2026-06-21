import type blessed from 'blessed';

/**
 * PROTOTYPE — story contract for the terminal component workbench.
 *
 * Keep this local until the previewer API has been validated by more
 * components.
 */
export interface PreviewStoryHandle {
  destroy(): void;
  focus?(): void;
}

export interface PreviewStory {
  description: string;
  id: string;
  mount(parent: blessed.Widgets.Node): PreviewStoryHandle;
  title: string;
}

export function defineStory(story: PreviewStory): PreviewStory {
  return story;
}
