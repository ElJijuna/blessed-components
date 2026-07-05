# SidebarLayout

Compose a sidebar and main region with deterministic collapse rules.

## Features

- Pure layout calculator with explicit and width-based collapse.
- Blessed adapter with mounted `sidebar` and `main` regions.
- Controlled and uncontrolled collapsed state.
- Shared Box theme contract for the root container.

## Pure Utility

```ts
import { calculateSidebarLayout } from 'blessed-components/sidebar-layout';

calculateSidebarLayout({
  width: 80,
  height: 20,
  sidebarWidth: 24,
  gap: 1,
});
```

## Blessed Adapter

```ts
import blessed from 'blessed';
import { sidebarLayout } from 'blessed-components/sidebar-layout/blessed';

const screen = blessed.screen({ smartCSR: true });
const layout = sidebarLayout({
  parent: screen,
  box: { top: 0, left: 0, right: 0, bottom: 0 },
  data: {
    sidebarWidth: 24,
    gap: 1,
    collapseBelow: 50,
    sidebarContent: 'Deployments\nLogs\nSettings',
    mainContent: 'Select a deployment.',
  },
});

screen.render();

layout.toggle();
screen.render();
```

Append custom widgets to `layout.sidebar` and `layout.main` for richer screens.
The adapter never calls `screen.render()`.
