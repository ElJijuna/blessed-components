import blessed from 'blessed';
import { cardBody, cardRoot, cardTitle, createTheme, progressBar, stat } from 'blessed-components';

const screen = blessed.screen({
  fullUnicode: true,
  smartCSR: true,
  title: '{{appName}}',
});
const theme = createTheme({
  colors: {
    primary: 'cyan',
    success: 'green',
  },
});
const welcome = cardRoot({
  box: {
    border: 'line',
    height: 9,
    left: 2,
    top: 1,
    width: 52,
  },
  data: {
    theme,
  },
  parent: screen,
});

cardTitle({
  box: {
    height: 1,
    left: 1,
    top: 1,
    width: 48,
  },
  data: {
    content: '{{appName}}',
    theme,
  },
  parent: welcome.element,
});

cardBody({
  box: {
    height: 4,
    left: 1,
    top: 3,
    width: 48,
  },
  data: {
    content: 'Edit src/app.ts to start building your terminal app.',
    theme,
  },
  parent: welcome.element,
});

stat({
  box: {
    height: 4,
    left: 4,
    top: 11,
    width: 30,
  },
  data: {
    label: 'Status',
    theme,
    trend: { direction: 'up', value: '+ ready' },
    value: 'online',
  },
  parent: screen,
});

progressBar({
  box: {
    height: 1,
    left: 4,
    top: 16,
    width: 42,
  },
  data: {
    label: 'Setup',
    theme,
    value: 0.72,
  },
  parent: screen,
});

screen.key(['C-c', 'escape', 'q'], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
