# Form

Headless form registry and Blessed adapter for typed terminal forms.

## Features

- Register fields by stable id.
- Controlled and uncontrolled field values.
- Field-level validation.
- Submit, reset, and validation callbacks.
- Blessed `form` container adapter.
- Works with existing component handles through getter/setter bindings.

## Pure API

```ts
import { createFormState } from 'blessed-components/form';

const form = createFormState({
  fields: [
    {
      id: 'environment',
      defaultValue: 'production',
      validate(value) {
        return value === '' ? 'Environment is required' : undefined;
      },
    },
  ],
  onSubmit(values) {
    // values.environment
  },
});

form.setValue('environment', 'staging');
form.submit();
```

## Blessed Adapter

```ts
import blessed from 'blessed';
import { form } from 'blessed-components/form/blessed';
import { textField } from 'blessed-components/text-field/blessed';

const screen = blessed.screen({ smartCSR: true });
const deployForm = form({
  parent: screen,
  data: {
    onSubmit(values) {
      // Submit values.
    },
  },
});

const environment = textField({
  parent: deployForm.element,
  box: { height: 3, width: 24 },
  data: { label: 'Environment', defaultValue: 'production' },
});

deployForm.registerField({
  id: 'environment',
  getValue: environment.value,
  setValue: environment.setValue,
  validate(value) {
    return value === '' ? 'Environment is required' : undefined;
  },
});
```

## Validation

`validate()` returns errors keyed by field id. `submit()` calls `validate()`
first and only calls `onSubmit` when there are no errors.

## Lifecycle

The Blessed handle exposes `element`, `registerField()`, `unregisterField()`,
`values()`, `errors()`, `validate()`, `submit()`, `reset()`, `focusNext()`,
`focusPrevious()`, `setData()`, and `destroy()`.
