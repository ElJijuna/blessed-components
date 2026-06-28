# Checkbox

Boolean input with unchecked, checked, and indeterminate visual states.

```ts
import { checkbox, renderCheckbox } from 'blessed-components';

renderCheckbox({
  checked: true,
  label: 'Include prereleases',
});

checkbox({
  parent: screen,
  data: {
    defaultChecked: false,
    label: 'Include prereleases',
    onCheckedChange(checked) {
      // Persist the new value.
    },
  },
});
```

Keyboard support:

- Enter and Space toggle the checkbox.
- Mouse click toggles the checkbox.

Controlled checkboxes emit `onCheckedChange`; visual state updates when the
caller passes a new `checked` value to `setData`.
