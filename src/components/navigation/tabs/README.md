# Tabs

Horizontal tab navigation for switching between labeled views.

```ts
import { renderTabs } from 'blessed-components/tabs';

renderTabs({
  activeId: 'logs',
  focusedId: 'logs',
  items: [
    { id: 'overview', label: 'Overview' },
    { id: 'logs', label: 'Logs' },
  ],
  width: 32,
});
```

Active tabs are wrapped in brackets. Focus and disabled states are represented
with text markers, so tabs remain meaningful without color.

Use `tabs` from `blessed-components/tabs/blessed` for the interactive Blessed
adapter with Left/Right, Home/End, Enter, and Space support.
