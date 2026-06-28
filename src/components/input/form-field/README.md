# FormField

Label, control, hint, required, and error composition.

`FormField` does not own validation, focus, or control state. It renders a
label, caller-provided control content, and one supporting row.

```ts
import { renderButton, renderFormField } from 'blessed-components';

renderFormField({
  control: renderButton({ label: 'Choose project', variant: 'plain' }),
  hint: 'Required before deployment',
  label: 'Project',
  required: true,
  width: 32,
});
```

When `error` is present it is rendered instead of `hint`.
