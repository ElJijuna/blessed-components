# DropdownMenu

Top-level menu bar with one open dropdown action menu.

## Imports

```ts
import { renderDropdownMenu } from 'blessed-components/dropdown-menu';
import { dropdownMenu } from 'blessed-components/dropdown-menu/blessed';
```

## Pure Renderer

```ts
const content = renderDropdownMenu({
  focusedId: 'file',
  openId: 'file',
  activeItemId: 'open',
  height: 5,
  width: 40,
  items: [
    {
      id: 'file',
      label: 'File',
      items: [
        { id: 'new', label: 'New', shortcut: 'n' },
        { id: 'open', label: 'Open', shortcut: 'o' },
      ],
    },
  ],
});
```

## Blessed Adapter

Keyboard support:

- `left` / `right`: move between top-level menus.
- `down`: open focused menu or move down inside open menu.
- `up`: move up inside open menu.
- `enter` / `space`: open menu or activate focused action.
- `escape`: close menu.

Mouse support:

- Click top row: open or close menu.
- Click dropdown row: activate action.
