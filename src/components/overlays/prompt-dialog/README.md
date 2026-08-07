# PromptDialog

Modal text prompt with controlled or uncontrolled value and visibility.

```ts
import { renderPromptDialog } from 'blessed-components/prompt-dialog';
import { promptDialog } from 'blessed-components/prompt-dialog/blessed';

renderPromptDialog({
  defaultValue: 'main',
  message: 'Branch name',
  title: 'Rename',
});
```

The pure renderer returns deterministic prompt content without owning focus or
input state.

## Blessed adapter

```ts
const rename = promptDialog({
  data: {
    defaultOpen: true,
    defaultValue: 'main',
    hint: 'Use lowercase branch names',
    id: 'rename-branch',
    message: 'Branch name',
    onSubmit(value) {
      renameBranch(value);
    },
    title: 'Rename branch',
  },
  parent: screen,
});
```

`PromptDialogData` supports controlled `open`/`value` and uncontrolled
`defaultOpen`/`defaultValue` usage. The handle exposes `open()`, `close()`,
`toggle()`, `value()`, `setValue()`, `clear()`, `submit()`, `cancel()`,
`focus()`, `setData()`, and `destroy()`.

Keyboard behavior:

- `Tab` and `Shift-Tab` cycle through input, submit, and cancel without leaving
  the topmost modal.
- `Enter` submits from the input or activates the focused button.
- `Escape` cancels the topmost prompt.

Closing restores the element that was focused before opening. Disabled inputs
and submit actions are removed from the managed focus order. Visual focus and
error cues remain understandable without relying on terminal color.

The adapter never calls `screen.render()`, so callers can batch updates.
