# TextField

`TextField` renders a labeled single-line field with optional placeholder, hint,
error, required marker, disabled state, and focus cue.

```ts
import { renderTextField } from 'blessed-components/text-field';

renderTextField({
  hint: 'Used by deploy commands.',
  label: 'Environment',
  placeholder: 'production',
  required: true,
  value: '',
  width: 32,
});
```

For Blessed apps, use the adapter:

```ts
import { textField } from 'blessed-components/text-field/blessed';

const environment = textField({
  box: { height: 4, width: 40 },
  data: {
    label: 'Environment',
    onSubmit(value) {
      // Persist or validate the submitted value.
    },
    placeholder: 'production',
  },
  parent: screen,
});
```

The adapter supports controlled `value` data and uncontrolled `defaultValue`
data. Use `onValueChange` to mirror edits into controlled state.
