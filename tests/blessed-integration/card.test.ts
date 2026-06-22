import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import {
  cardBody,
  cardDescription,
  cardFooter,
  cardHeader,
  cardRoot,
  cardTitle,
} from '../../src/adapters/blessed/card.js';
import { createTheme } from '../../src/core/theme.js';

describe('Blessed Card adapter', () => {
  it('creates a themed root frame and updates it without replacing the element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        background: 'black',
        border: 'cyan',
        foreground: 'white',
      },
    });

    try {
      const component = cardRoot({
        box: { height: 8, width: 40 },
        data: {
          capabilities: { colorLevel: 1 },
          theme,
        },
        parent: screen,
      });
      const { element } = component;

      expect(element.options.border).toBe('line');
      expect(element.options.padding).toEqual({ left: 1, right: 1 });
      expect(element.style.fg).toBe('white');
      expect(element.style.bg).toBe('black');
      expect(element.style.border?.fg).toBe('cyan');

      component.setData({
        capabilities: { colorLevel: 0 },
        theme,
      });

      expect(component.element).toBe(element);
      expect(element.style.fg).toBeUndefined();
      expect(element.style.bg).toBeUndefined();
      expect(element.style.border?.fg).toBeUndefined();
    } finally {
      screen.destroy();
    }
  });

  it('composes named regions with safe content and predictable default layout', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const root = cardRoot({
        box: { height: 10, width: 40 },
        parent: screen,
      });
      const header = cardHeader({ parent: root.element });
      const title = cardTitle({
        data: {
          capabilities: { colorLevel: 1 },
          content: '{red-fg}Deploy{/red-fg}',
        },
        parent: header.element,
      });
      const description = cardDescription({
        data: {
          capabilities: { colorLevel: 1 },
          content: '\u001B[31mProduction\u001B[0m',
        },
        parent: header.element,
      });
      const body = cardBody({
        data: { content: 'Service health' },
        parent: root.element,
      });
      const footer = cardFooter({
        data: { content: 'Updated now' },
        parent: root.element,
      });

      expect(root.element.children).toEqual(
        expect.arrayContaining([header.element, body.element, footer.element]),
      );
      expect(header.element.children).toEqual(
        expect.arrayContaining([title.element, description.element]),
      );
      expect(title.element.getContent()).toBe('Deploy');
      expect(description.element.getContent()).toBe('Production');
      expect(title.element.style.bold).toBe(true);
      expect(description.element.style.fg).toBe('grey');
      expect(header.element.options).toMatchObject({ height: 2, left: 0, right: 0, top: 0 });
      expect(body.element.options).toMatchObject({ bottom: 1, left: 0, right: 0, top: 2 });
      expect(footer.element.options).toMatchObject({ bottom: 0, height: 1, left: 0, right: 0 });
    } finally {
      screen.destroy();
    }
  });

  it('updates and destroys one region through the shared handle contract', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const root = cardRoot({
        box: { height: 8, width: 40 },
        parent: screen,
      });
      const footer = cardFooter({
        box: { style: { fg: 'yellow' } },
        data: { content: 'Queued', tone: 'danger' },
        parent: root.element,
      });
      const { element } = footer;

      footer.setData({ content: 'Complete', tone: 'success' });

      expect(footer.element).toBe(element);
      expect(element.getContent()).toBe('Complete');
      expect(element.style.fg).toBe('yellow');

      footer.destroy();

      expect(root.element.children).not.toContain(element);
    } finally {
      screen.destroy();
    }
  });
});
