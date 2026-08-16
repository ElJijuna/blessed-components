/**
 * Terminal component workbench.
 *
 * Run interactively with `npm run preview`.
 * Run a non-interactive lifecycle smoke test with
 * `npm run preview -- --smoke`.
 */
import { PassThrough } from 'node:stream';

import blessed from 'blessed';

import { type SearchBarData, searchBar } from '@/index.js';

import { filterStories, sortStories, storyCategory } from './catalog.js';
import { stories } from './stories.js';
import type { PreviewStory, PreviewStoryHandle } from './story.js';

interface PreviewOptions {
  smoke?: boolean;
}

interface ClickableNavigationList extends blessed.Widgets.ListElement {
  items: blessed.Widgets.BlessedElement[];
}

export function runPreview({ smoke = false }: PreviewOptions = {}): void {
  const input = smoke ? new PassThrough() : process.stdin;
  const output = smoke ? new PassThrough() : process.stdout;
  const screen = blessed.screen({
    dockBorders: true,
    fullUnicode: true,
    input,
    mouse: !smoke,
    output,
    smartCSR: true,
    terminal: smoke ? 'xterm-256color' : undefined,
    title: 'Blessed Components — Workbench',
  });
  const catalogStories = sortStories(stories);
  const categories = new Set(catalogStories.map(storyCategory)).size;
  const header = blessed.box({
    content:
      ' {bold}{white-fg}◆ BLESSED COMPONENTS{/white-fg}{/bold}  {cyan-fg}/ TERMINAL WORKBENCH{/cyan-fg}\n' +
      ' {grey-fg}Explore behavior, states and interaction contracts without leaving the terminal.{/grey-fg}',
    height: 3,
    left: 0,
    parent: screen,
    right: 0,
    style: { bg: 'blue', fg: 'white' },
    tags: true,
    top: 0,
  });

  blessed.box({
    align: 'right',
    content: `{bold}${stories.length}{/bold} stories  ·  ${categories} groups\n{grey-fg}keyboard + mouse ready{/grey-fg} `,
    height: 2,
    parent: header,
    right: 1,
    style: { bg: 'blue', fg: 'white' },
    tags: true,
    top: 0,
    width: 30,
  });
  const navigation = blessed.list({
    alwaysScroll: true,
    bottom: 5,
    border: 'line',
    items: catalogStories.map(({ title }) => ` ${title}`),
    keys: true,
    label: ` Catalog · ${catalogStories.length} · grouped A–Z `,
    left: 0,
    mouse: !smoke,
    parent: screen,
    scrollable: true,
    scrollbar: {
      ch: '▐',
      track: {
        bg: 'black',
      },
      style: {
        bg: 'cyan',
      },
    },
    style: {
      border: {
        fg: 'blue',
      },
      item: {
        fg: 'grey',
      },
      selected: {
        bg: 'blue',
        bold: true,
        fg: 'white',
      },
    },
    top: 6,
    vi: true,
    width: '31%',
  });
  const viewport = blessed.box({
    bottom: 5,
    border: 'line',
    label: ' Preview · live ',
    left: '31%',
    padding: { left: 1, right: 1 },
    parent: screen,
    right: 0,
    style: {
      border: {
        fg: 'cyan',
      },
    },
    top: 3,
  });
  const status = blessed.box({
    bottom: 0,
    border: 'line',
    height: 5,
    label: ' Inspector ',
    left: 0,
    padding: { left: 1, right: 1 },
    parent: screen,
    right: 0,
    tags: false,
    style: {
      border: {
        fg: 'blue',
      },
    },
  });

  let currentHandle: PreviewStoryHandle | undefined;
  let currentStory: PreviewStory | undefined;
  let currentIndex = 0;
  let visibleStories = catalogStories;

  const searchData = (resultCount: number): SearchBarData => ({
    onQueryChange: updateCatalog,
    placeholder: 'component, story, or description',
    resultCount,
    showSubmit: false,
  });
  const selectStory = (index: number): void => {
    navigation.select(index);
    renderStory(index);
  };
  const renderStory = (index: number): void => {
    const story = visibleStories[index];

    if (story === undefined) {
      return;
    }

    currentHandle?.destroy();
    currentHandle = undefined;
    currentIndex = index;
    currentStory = story;

    try {
      currentHandle = story.mount(viewport);
      const category = storyCategory(story).replaceAll('-', ' ').toUpperCase();

      viewport.setLabel(` Preview · ${story.title} `);
      status.setLabel(
        ` Inspector · ${String(index + 1).padStart(3, '0')}/${visibleStories.length} · ${catalogStories.length} total `,
      );
      status.setContent(
        `${category}  ›  ${story.id}\n${story.description}\n/ search · ↑/↓ or j/k browse · r reload · tab change focus · q quit`,
      );
    } catch (error) {
      const message = error instanceof Error ? (error.stack ?? error.message) : String(error);

      status.setContent(` ${story.id}\n ERROR: ${message}`);
    }

    screen.render();
  };
  const bindNavigationClicks = (): void => {
    (navigation as ClickableNavigationList).items.forEach((item, index) => {
      item.on('click', () => {
        if (index === currentIndex) {
          return;
        }

        selectStory(index);
      });
    });
  };

  function updateCatalog(query: string): void {
    const previouslySelectedStory = currentStory;

    visibleStories = filterStories(catalogStories, query);
    navigation.setItems(visibleStories.map(({ title }) => ` ${title}`));
    navigation.setLabel(
      query.trim().length === 0
        ? ` Catalog · ${visibleStories.length} · grouped A–Z `
        : ` Catalog · ${visibleStories.length}/${catalogStories.length} matches `,
    );
    bindNavigationClicks();
    catalogSearch.setData(searchData(visibleStories.length));

    if (visibleStories.length === 0) {
      currentHandle?.destroy();
      currentHandle = undefined;
      currentStory = undefined;
      currentIndex = 0;
      viewport.setLabel(' Preview · no match ');
      status.setLabel(` Inspector · 0/${catalogStories.length} `);
      status.setContent(
        `No components match “${query}”.\nTry a component name, story title, category, or description.\nEsc clear search · tab change focus · q quit`,
      );
      screen.render();

      return;
    }

    const preservedIndex =
      previouslySelectedStory === undefined ? -1 : visibleStories.indexOf(previouslySelectedStory);

    selectStory(preservedIndex >= 0 ? preservedIndex : 0);
  }

  const destroy = (): void => {
    currentHandle?.destroy();
    screen.destroy();
  };

  navigation.on('select', (_item, index) => {
    renderStory(index);
  });
  bindNavigationClicks();

  const catalogSearch = searchBar({
    box: {
      border: 'line',
      height: 3,
      left: 0,
      padding: { left: 1, right: 1 },
      top: 3,
      width: '31%',
    },
    data: searchData(catalogStories.length),
    parent: screen,
  });

  screen.key('C-c', () => {
    destroy();
  });

  screen.key('q', () => {
    if (screen.focused !== catalogSearch?.element) {
      destroy();
    }
  });

  screen.key('r', () => {
    if (screen.focused !== catalogSearch?.element) {
      renderStory(currentIndex);
    }
  });

  screen.key('/', () => {
    if (screen.focused !== catalogSearch?.element) {
      catalogSearch?.focus();
      screen.render();
    }
  });

  screen.key('tab', () => {
    if (screen.focused === catalogSearch?.element) {
      navigation.focus();
    } else if (screen.focused === navigation) {
      if (currentHandle?.focus === undefined) {
        viewport.focus();
      } else {
        currentHandle.focus();
      }
    } else {
      catalogSearch?.focus();
    }

    screen.render();
  });

  screen.on('resize', () => {
    renderStory(currentIndex);
  });

  navigation.focus();
  selectStory(0);

  if (smoke) {
    for (const [index] of catalogStories.entries()) {
      selectStory(index);
    }

    destroy();
    process.stdout.write(`Preview smoke test passed for ${stories.length} stories.\n`);
  }
}

runPreview({
  smoke: process.argv.includes('--smoke'),
});
