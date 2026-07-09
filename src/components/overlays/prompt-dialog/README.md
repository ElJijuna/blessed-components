# PromptDialog

Renders modal prompt content: title, message, current value, validation text, and action labels.

```ts
import { renderPromptDialog } from 'blessed-components';

renderPromptDialog({
  title: 'Rename',
  message: 'Branch name',
  defaultValue: 'main',
});
```

## API

`renderPromptDialog(options)` returns deterministic text for a prompt body. Focus trapping and input editing belong in adapters.
