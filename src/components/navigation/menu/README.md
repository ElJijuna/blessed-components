# Menu

Vertical action navigation for terminal commands.

`Menu` is for actions, not selection state. It owns focus movement and emits the
activated item through `onAction`; callers decide what the command does.

```ts
import { menu, renderMenu } from 'blessed-components';

renderMenu({
  activeId: 'deploy',
  height: 4,
  items: [
    { id: 'build', label: 'Build', shortcut: 'b' },
    { id: 'deploy', label: 'Deploy', shortcut: 'd' },
  ],
  width: 28,
});

menu({
  parent: screen,
  box: { height: 6, width: 32 },
  data: {
    items: [
      { id: 'build', label: 'Build', shortcut: 'b' },
      { id: 'deploy', label: 'Deploy', shortcut: 'd' },
    ],
    onAction(item) {
      // Run the selected command.
    },
  },
});
```

Keyboard support:

- Up and Down move between enabled actions.
- Home and End jump to the first or last enabled action.
- Page Up and Page Down move by the visible viewport.
- Enter and Space activate the focused action.

Mouse support:

- Row click focuses and activates the clicked enabled action.
- Disabled row clicks are ignored.
- Wheel down/up moves to the next or previous enabled action.
- Pass `box: { mouse: false }` to opt out of Blessed mouse registration.

Labels and shortcuts are sanitized before width-aware truncation.
