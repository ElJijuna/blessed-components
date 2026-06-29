# Breadcrumb

`Breadcrumb` renders a compact location path for nested resources, routes, and
drill-down views. It removes terminal markup, collapses long middle segments
when width is constrained, and returns plain text from the pure renderer.

```ts
import { renderBreadcrumb } from 'blessed-components/breadcrumb';

renderBreadcrumb({
  items: [
    { label: 'Home' },
    { label: 'Projects' },
    { label: 'blessed-components' },
  ],
});
// "Home / Projects / blessed-components"
```

```ts
renderBreadcrumb({
  items: [
    { label: 'Home' },
    { label: 'Projects' },
    { label: 'blessed-components' },
    { label: 'Roadmap' },
  ],
  width: 16,
});
// "Home / … / Road…"
```

```ts
import blessed from 'blessed';
import { breadcrumb } from 'blessed-components/breadcrumb/blessed';

const screen = blessed.screen({ smartCSR: true });
const path = breadcrumb({
  parent: screen,
  box: { top: 0, left: 0, width: 30, height: 1 },
  data: {
    items: [{ label: 'Home' }, { label: 'Services' }, { label: 'API' }],
  },
});

screen.render();
path.destroy();
screen.destroy();
```

Use `Breadcrumb` for read-only navigation context. Pair it with interactive
menus or tabs when users need to move between views.
