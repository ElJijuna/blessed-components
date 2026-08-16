# RouteTabs

`RouteTabs` represents open application routes as tabs while keeping routing
and persistence in application code. It supports an active route, keyboard
focus, unsaved-change markers, disabled routes, and explicit close affordances.

```ts
import { renderRouteTabs } from 'blessed-components/route-tabs';

renderRouteTabs({
  focusedId: 'editor',
  items: [
    { id: 'overview', label: 'Overview' },
    { closable: true, dirty: true, id: 'editor', label: 'Editor' },
  ],
  routeId: 'editor',
  width: 48,
});
```

Use the Blessed adapter when routes must be interactive:

```ts
import { routeTabs } from 'blessed-components/route-tabs/blessed';

const routes = routeTabs({
  parent: screen,
  data: {
    items,
    routeId: router.currentRouteId(),
    onNavigate(routeId) {
      router.navigate(routeId);
    },
    onClose(item) {
      if (!item.dirty || confirmDiscard(item.id)) {
        closeRoute(item.id);
      }
    },
  },
});
```

Left/Right and Home/End move focus. Enter or Space requests navigation. Delete
or Ctrl-W requests closing the focused route when it is marked `closable`.
Closing never mutates `items`; the application decides whether to confirm dirty
routes and supplies the updated route collection through `setData`.
