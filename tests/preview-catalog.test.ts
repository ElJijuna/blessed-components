import { describe, expect, it } from 'vitest';

import { filterStories, sortStories } from '../examples/preview-prototype/catalog.js';
import type { PreviewStory } from '../examples/preview-prototype/story.js';

function story(id: string, title: string, description = ''): PreviewStory {
  return {
    description,
    id,
    mount: () => ({ destroy() {} }),
    title,
  };
}

describe('preview catalog', () => {
  const stories = [
    story('table/zebra', 'Table / Zebra'),
    story('button/secondary', 'Button / Secondary'),
    story('button/primary', 'Button / Primary', 'Deploy action'),
    story('alert/error', 'Alert / Error'),
  ] as const;

  it('sorts by component group and title', () => {
    expect(sortStories(stories).map(({ id }) => id)).toEqual([
      'alert/error',
      'button/primary',
      'button/secondary',
      'table/zebra',
    ]);
  });

  it('searches case-insensitively across category, id, title, and description', () => {
    const sortedStories = sortStories(stories);

    expect(filterStories(sortedStories, 'BUTTON').map(({ id }) => id)).toEqual([
      'button/primary',
      'button/secondary',
    ]);
    expect(filterStories(sortedStories, 'button sec').map(({ id }) => id)).toEqual([
      'button/secondary',
    ]);
    expect(filterStories(sortedStories, 'deploy').map(({ id }) => id)).toEqual(['button/primary']);
  });
});
