# Select

`Select` renders a compact single-selection control. Closed Selects show one
trigger row. Open Selects show the trigger plus a bounded option list with
cursor, selected, and disabled markers.

```ts
import { renderSelect } from 'blessed-components/select';

renderSelect({
  height: 5,
  items: [
    { id: 'prod', label: 'Production' },
    { id: 'stage', label: 'Staging' },
  ],
  open: true,
  value: 'prod',
  width: 24,
});
```

For Blessed apps, use the adapter:

```ts
import { select } from 'blessed-components/select/blessed';

const environment = select({
  box: { height: 5, width: 32 },
  data: {
    items: [
      { id: 'prod', label: 'Production' },
      { id: 'stage', label: 'Staging' },
    ],
    onValueChange(value) {
      // Persist the selected value.
    },
  },
  parent: screen,
});
```

Use `value`/`open` for controlled state, or `defaultValue` for uncontrolled
selection. Keyboard support includes Up, Down, Enter, Space, and Escape.
