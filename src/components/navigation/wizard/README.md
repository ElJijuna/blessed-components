# Wizard

`Wizard` coordinates a guided sequence of pages with guarded forward movement,
unguarded back movement, explicit cancellation, and one final completion. Its
state model and renderer are independent of Blessed.

```ts
import { createWizardState, renderWizard } from 'blessed-components/wizard';

const steps = [
  { id: 'target', label: 'Target', content: 'Choose a deployment target.' },
  { id: 'review', label: 'Review', content: 'Review and create.' },
];
const flow = createWizardState({
  steps,
  onCancel: () => closeSetup(),
  onComplete: () => createDeployment(),
});

renderWizard({ activeIndex: flow.activeIndex(), steps, width: 60 });
flow.next();
```

A step's `canAdvance` guard may return `false` or an explanatory string. Back
navigation never invokes the guard. After cancellation or completion, requests
are rejected until `reset()` starts a new run.

The Blessed adapter can be mounted as an in-layout page or as a modal overlay.
Left/Right and Shift-Tab/Tab navigate, Enter advances or completes, and Escape
cancels. Modal mode participates in the shared overlay stack and restores focus
when the flow exits.

```ts
import { wizard } from 'blessed-components/wizard/blessed';

const setup = wizard({
  box: { border: 'line', height: 14, width: 64 },
  data: {
    id: 'deployment-setup',
    steps,
    onComplete: deploy,
  },
  mode: 'modal',
  parent: screen,
});
```
