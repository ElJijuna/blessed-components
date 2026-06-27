# TabList

Horizontal tab trigger collection for composing terminal navigation.

`TabList` renders and manages only the trigger row. It does not own panel
content, route changes, or view state beyond the active trigger identifier.

```ts
import { renderTabList, tabList } from 'blessed-components';

renderTabList({
  activeId: 'logs',
  focusedId: 'logs',
  items: [
    { id: 'overview', label: 'Overview' },
    { id: 'logs', label: 'Logs' },
  ],
  width: 32,
});

tabList({
  parent: screen,
  box: { height: 1, width: 32 },
  data: {
    defaultValue: 'overview',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'logs', label: 'Logs' },
    ],
    onActivate(id) {
      // show the matching panel in application code
    },
  },
});
```

Keyboard support:

- Left and Right move focus between enabled triggers.
- Home and End jump to the first or last enabled trigger.
- Enter and Space activate the focused trigger.

The pure renderer strips Blessed tags and ANSI sequences from labels before
truncating by terminal-cell width.
