import type { PreviewStory } from './story.js';

function normalizeSearchText(value: string): string {
  return value.toLocaleLowerCase('en').replaceAll('-', ' ');
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, 'en', {
    numeric: true,
    sensitivity: 'base',
  });
}

/** Returns the component group encoded in a story identifier. */
export function storyCategory(story: PreviewStory): string {
  return story.id.split('/')[0] ?? 'component';
}

/** Sorts stories by component group, then by their visible title. */
export function sortStories(stories: readonly PreviewStory[]): readonly PreviewStory[] {
  return [...stories].sort((left, right) => {
    const categoryOrder = compareText(storyCategory(left), storyCategory(right));

    if (categoryOrder !== 0) {
      return categoryOrder;
    }

    const titleOrder = compareText(left.title, right.title);

    return titleOrder !== 0 ? titleOrder : compareText(left.id, right.id);
  });
}

/** Filters stories using every query term across their catalog metadata. */
export function filterStories(
  stories: readonly PreviewStory[],
  query: string,
): readonly PreviewStory[] {
  const terms = normalizeSearchText(query).trim().split(/\s+/u).filter(Boolean);

  if (terms.length === 0) {
    return stories;
  }

  return stories.filter((story) => {
    const searchableText = normalizeSearchText(
      [storyCategory(story), story.id, story.title, story.description].join(' '),
    );

    return terms.every((term) => searchableText.includes(term));
  });
}
