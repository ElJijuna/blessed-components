/**
 * PROTOTYPE — terminal component workbench.
 *
 * Question being tested: does a Storybook-like registry, navigation, mount,
 * update, and destroy lifecycle feel natural for Blessed components?
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
    title: 'blessed-components workbench',
  });
  const navigation = blessed.list({
    parent: screen,
    top: 0,
    left: 0,
    bottom: 5,
    width: '30%',
    border: 'line',
    keys: true,
    label: ' Components ',
    mouse: !smoke,
    items: stories.map(({ title }) => title),
    scrollbar: {
      ch: ' ',
      track: {
        bg: 'grey',
      },
      style: {
        inverse: true,
      },
    },
    style: {
      border: {
        fg: 'cyan',
      },
      item: {
        fg: 'white',
      },
      selected: {
        bg: 'cyan',
        fg: 'black',
      },
    },
  });
  const viewport = blessed.box({
    parent: screen,
    top: 0,
    left: '30%',
    right: 0,
    bottom: 5,
    border: 'line',
    label: ' Preview ',
    style: {
      border: {
        fg: 'cyan',
      },
    },
  });
  const status = blessed.box({
    parent: screen,
    left: 0,
    right: 0,
    bottom: 0,
    height: 5,
    border: 'line',
    label: ' Story ',
    tags: false,
    style: {
      border: {
        fg: 'grey',
      },
    },
  });

  let currentHandle: PreviewStoryHandle | undefined;
  let currentIndex = 0;

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
      status.setContent(
        ` ${story.id}\n ${story.description}\n ↑/↓ select  enter open  r reload  tab focus  q quit`,
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

  navigation.select(0);
  navigation.focus();
  renderStory(0);

  if (smoke) {
    for (const [index] of stories.entries()) {
      navigation.select(index);
      renderStory(index);
    }

    destroy();
    process.stdout.write(`Preview smoke test passed for ${stories.length} stories.\n`);
  }
}

runPreview({
  smoke: process.argv.includes('--smoke'),
});
