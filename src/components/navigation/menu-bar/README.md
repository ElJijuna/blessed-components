# MenuBar

Render top-level horizontal menus with keyboard focus and active/open state.

```ts
import { renderMenuBar } from 'blessed-components/menu-bar';

renderMenuBar({
  activeId: 'file',
  focusedId: 'view',
  items: [
    { id: 'file', label: 'File' },
    { id: 'edit', label: 'Edit' },
    { id: 'view', label: 'View' },
  ],
  width: 40,
});
```

```ts
import { menuBar } from 'blessed-components/menu-bar/blessed';

const top = menuBar({
  parent: screen,
  box: { height: 1, width: 48 },
  data: {
    defaultValue: 'file',
    items,
    onActivate(value) {
      openMenu(value);
    },
  },
});

top.focus();
```

The pure renderer returns plain terminal text. The Blessed adapter owns focus,
keyboard, and wheel listeners while applications decide when to call
`screen.render()`.

Keyboard navigation:

| Key | Action |
| --- | --- |
| `Left`, `Right` | Move focus |
| `Home`, `End` | First or last menu |
| `Enter`, `Space` | Activate focused menu |
