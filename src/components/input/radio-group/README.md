# RadioGroup

One value from a visible set of choices.

```ts
import { radioGroup, renderRadioGroup } from 'blessed-components';

renderRadioGroup({
  height: 3,
  items: [
    { id: 'stable', label: 'Stable' },
    { id: 'beta', label: 'Beta' },
  ],
  value: 'stable',
  width: 24,
});

radioGroup({
  parent: screen,
  data: {
    defaultValue: 'stable',
    items: [
      { id: 'stable', label: 'Stable' },
      { id: 'beta', label: 'Beta' },
    ],
    onValueChange(value) {
      // Persist the selected option.
    },
  },
});
```

Keyboard support:

- Up and Down move focus.
- Enter and Space select the focused option.
