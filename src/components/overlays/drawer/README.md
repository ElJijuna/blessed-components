# Drawer

Edge-attached temporary panel with modal focus handling.

```ts
import { createDrawerState } from 'blessed-components/drawer';
import {
  drawerRoot,
  drawerContent,
  drawerHeader,
  drawerBody,
  drawerFooter,
} from 'blessed-components/drawer/blessed';
```

`createDrawerState` supports controlled and uncontrolled open state. The Blessed
adapter owns Escape dismissal, focus trapping, focus restoration, and edge
content layout.

```ts
const root = drawerRoot({
  data: { defaultOpen: true, id: 'settings' },
  parent: screen,
});

const panel = drawerContent({
  data: { edge: 'right', size: 36 },
  parent: root.element,
});
```

Content defaults to the right edge. Use `edge: 'left' | 'right' | 'top' |
'bottom'` and `size` to choose panel placement.
