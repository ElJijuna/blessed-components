/**
 * Terminal component workbench.
 *
 * Run interactively with `npm run preview`.
 * Run a non-interactive lifecycle smoke test with
 * `npm run preview -- --smoke`.
 */
import { PassThrough } from 'node:stream';

import blessed from 'blessed';

import { stories } from './stories.js';
import type { PreviewStoryHandle } from './story.js';

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
  const categories = new Set(stories.map(({ id }) => id.split('/')[0])).size;
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
    items: stories.map(({ title }) => ` ${title}`),
    keys: true,
    label: ` Catalog · ${stories.length} `,
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
    top: 3,
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
  let currentIndex = 0;

  const selectStory = (index: number): void => {
    navigation.select(index);
    renderStory(index);
  };
  const renderStory = (index: number): void => {
    const story = stories[index];

    if (story === undefined) {
      return;
    }

    currentHandle?.destroy();
    currentHandle = undefined;
    currentIndex = index;

    try {
      currentHandle = story.mount(viewport);
      const category = (story.id.split('/')[0] ?? 'component').replaceAll('-', ' ').toUpperCase();

      viewport.setLabel(` Preview · ${story.title} `);
      status.setLabel(` Inspector · ${String(index + 1).padStart(3, '0')}/${stories.length} `);
      status.setContent(
        `${category}  ›  ${story.id}\n${story.description}\n↑/↓ or j/k browse · enter/click open · r reload · tab change focus · q quit`,
      );
    } catch (error) {
      const message = error instanceof Error ? (error.stack ?? error.message) : String(error);

      status.setContent(` ${story.id}\n ERROR: ${message}`);
    }

    screen.render();
  };
  const destroy = (): void => {
    currentHandle?.destroy();
    screen.destroy();
  };

  navigation.on('select', (_item, index) => {
    renderStory(index);
  });
  (navigation as ClickableNavigationList).items.forEach((item, index) => {
    item.on('click', () => {
      if (index === currentIndex) {
        return;
      }

      selectStory(index);
    });
  });

  screen.key(['q', 'C-c'], () => {
    destroy();
  });

  screen.key('r', () => {
    renderStory(currentIndex);
  });

  screen.key('tab', () => {
    if (screen.focused === navigation) {
      if (currentHandle?.focus === undefined) {
        viewport.focus();
      } else {
        currentHandle.focus();
      }
    } else {
      navigation.focus();
    }

    screen.render();
  });

  screen.on('resize', () => {
    renderStory(currentIndex);
  });

  navigation.focus();
  selectStory(0);

  if (smoke) {
    for (const [index] of stories.entries()) {
      selectStory(index);
    }

    destroy();
    process.stdout.write(`Preview smoke test passed for ${stories.length} stories.\n`);
  }
}

runPreview({
  smoke: process.argv.includes('--smoke'),
});
