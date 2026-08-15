# BreadcrumbBar

`BreadcrumbBar` combines a compact location path with previous/next sibling
navigation and contextual actions. Its responsive renderer collapses the path
and omits controls that do not fit while exposing the visible focus targets.

```ts
import { renderBreadcrumbBar } from 'blessed-components/breadcrumb-bar';

renderBreadcrumbBar({
  items: [{ label: 'Projects' }, { label: 'API' }],
  previousSibling: { id: 'web', label: 'Web' },
  nextSibling: { id: 'worker', label: 'Worker' },
  actions: [{ id: 'refresh', label: 'Refresh', shortcut: 'R' }],
  width: 60,
});
```

Use the Blessed adapter for keyboard interaction. Left/right, Tab/Shift-Tab,
Home/End, Enter, and Space navigate and activate enabled controls.

```ts
import { breadcrumbBar } from 'blessed-components/breadcrumb-bar/blessed';

const navigation = breadcrumbBar({
  parent: screen,
  data: {
    items: [{ label: 'Projects' }, { label: 'API' }],
    nextSibling: { id: 'worker', label: 'Worker' },
    actions: [{ id: 'refresh', label: 'Refresh' }],
    onNavigateSibling(sibling) {
      openResource(sibling.id);
    },
    onAction(action) {
      runCommand(action.id);
    },
  },
});
```
