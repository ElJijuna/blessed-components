# AppShell

Compose a full terminal application frame with header, sidebar, content,
footer, and overlay regions.

## Features

- Pure layout calculator for app-level regions.
- Sidebar collapse rules shared with `SidebarLayout`.
- Blessed adapter with mounted regions for custom child widgets.
- Controlled and uncontrolled sidebar collapsed state.
- Optional overlay layer above the shell.

## Pure Utility

```ts
import { calculateAppShellLayout } from 'blessed-components/app-shell';

calculateAppShellLayout({
  width: 100,
  height: 30,
  headerHeight: 1,
  footerHeight: 1,
  sidebarWidth: 24,
  gap: 1,
});
```

## Blessed Adapter

```ts
import blessed from 'blessed';
import { appShell } from 'blessed-components/app-shell/blessed';

const screen = blessed.screen({ smartCSR: true });
const shell = appShell({
  parent: screen,
  box: { top: 0, left: 0, right: 0, bottom: 0 },
  data: {
    headerContent: 'Deployments',
    sidebarContent: 'Services\nLogs\nSettings',
    content: 'Select a service.',
    footerContent: 'q quit',
    sidebarWidth: 24,
    gap: 1,
  },
});

screen.render();
shell.toggleSidebar();
screen.render();
```

Append custom widgets to `shell.header`, `shell.sidebar`, `shell.content`,
`shell.footer`, and `shell.overlay` for richer applications. The adapter never
calls `screen.render()`.
