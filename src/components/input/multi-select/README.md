# MultiSelect

`MultiSelect` renders a compact multiple-selection control. Closed controls show
a summary, while open controls show a bounded option list with focus, selected,
and disabled markers.

```ts
import { renderMultiSelect } from 'blessed-components/multi-select';

renderMultiSelect({
  height: 5,
  items: [
    { id: 'api', label: 'API' },
    { id: 'worker', label: 'Worker' },
  ],
  open: true,
  values: ['api'],
  width: 24,
});
```

For Blessed apps, use the adapter:

```ts
import { multiSelect } from 'blessed-components/multi-select/blessed';

const services = multiSelect({
  box: { height: 6, width: 32 },
  data: {
    defaultValues: ['api'],
    items: [
      { id: 'api', label: 'API' },
      { id: 'worker', label: 'Worker' },
    ],
  },
  parent: screen,
});
```
