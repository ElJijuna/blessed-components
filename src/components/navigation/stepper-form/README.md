# StepperForm

`StepperForm` coordinates a multi-step form with field-aware validation,
guarded forward navigation, unguarded back navigation, and one completion
callback. The core state model is independent of Blessed.

```ts
import { createStepperFormState } from 'blessed-components/stepper-form';

const flow = createStepperFormState({
  steps: [
    { id: 'account', label: 'Account', fields: ['email'] },
    { id: 'confirm', label: 'Confirm' },
  ],
  getValues: () => form.values(),
  validate: (fields) => validateFields(fields),
  onComplete: (values) => save(values),
});

flow.next();
```

The Blessed adapter renders the active/completed/pending steps and navigation
labels. Use Left/Right or Shift-Tab/Tab to move, and Enter to advance or finish.

```ts
import { stepperForm } from 'blessed-components/stepper-form/blessed';

const flow = stepperForm({
  parent: screen,
  data: {
    steps: [{ id: 'account', label: 'Account' }, { id: 'confirm', label: 'Confirm' }],
    getValues: () => ({ email: email.value() }),
    onComplete: submit,
  },
});
```
