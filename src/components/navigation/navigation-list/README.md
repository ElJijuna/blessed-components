# NavigationList

Render route or view navigation with separate focus and active state.

```ts
import { renderNavigationList } from 'blessed-components/navigation-list';

renderNavigationList({
  activeId: 'deployments',
  focusedId: 'logs',
  height: 4,
  items: [
    { id: 'overview', label: 'Overview' },
    { id: 'deployments', label: 'Deployments', badge: '12' },
    { id: 'logs', label: 'Logs' },
  ],
  width: 28,
});
```

```ts
import { navigationList } from 'blessed-components/navigation-list/blessed';

const nav = navigationList({
  parent: screen,
  box: { height: 8, width: 32 },
  data: {
    defaultValue: 'overview',
    items,
    onValueChange(value) {
      routeTo(value);
    },
  },
});

nav.focus();
```

The pure renderer returns plain terminal text. The Blessed adapter owns focus,
keyboard, mouse, and wheel listeners while applications decide when to call
`screen.render()`.

Keyboard navigation:

| Key | Action |
| --- | --- |
| `Up`, `Down` | Move focus |
| `Home`, `End` | First or last target |
| `PageUp`, `PageDown` | Move by viewport |
| `Enter`, `Space` | Activate focused target |
