# Page

Compose a full-screen terminal view with header, body, and footer regions.

## Features

- Pure layout calculator for header/body/footer regions.
- Safe header renderer with optional right-aligned actions.
- Blessed adapter with mounted `header`, `body`, and `footer` elements.
- Shared Box theme contract for the root container.
- Callers can append child widgets into `page.body`.

## Pure utilities

```ts
import { calculatePageLayout, renderPageHeader } from 'blessed-components/page';

renderPageHeader({
  title: 'Deployments',
  subtitle: 'production',
  actions: 'q quit',
  width: 32,
});

calculatePageLayout({
  width: 80,
  height: 24,
  headerHeight: 1,
  footerHeight: 1,
  gap: 1,
});
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { page } from 'blessed-components/page/blessed';

const screen = blessed.screen({ smartCSR: true });
const view = page({
  parent: screen,
  box: { top: 0, left: 0, right: 0, bottom: 0 },
  data: {
    title: 'Deployments',
    subtitle: 'production',
    actions: 'q quit',
    content: 'No deploys running.',
    footer: 'Updated now',
    gap: 1,
  },
});

screen.render();

view.destroy();
screen.destroy();
```

The adapter never calls `screen.render()`.
