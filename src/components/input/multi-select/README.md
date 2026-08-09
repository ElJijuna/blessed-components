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

Up and Down open the list and move the active option. Enter or Space opens a
closed control and toggles the active option while open; Escape closes it.
Click the trigger to open or close, or click an open option to select or
deselect it. Keyboard and mouse interactions repaint immediately. Imperative
handle calls remain under application render control.
