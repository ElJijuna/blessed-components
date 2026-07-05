# GroupedList

GroupedList renders selectable list items under visible section headings.

Headers are display-only. Navigation, selection, keyboard handling, and mouse
row targeting apply only to enabled item rows.

```ts
import { renderGroupedList } from 'blessed-components/grouped-list';

renderGroupedList({
  activeId: 'api',
  height: 5,
  sections: [
    {
      id: 'services',
      title: 'Services',
      items: [{ id: 'api', label: 'API' }],
    },
  ],
  width: 32,
});
```
