# PasswordField

Masked single-line input for secrets with optional reveal state.

```ts
import { renderPasswordField } from 'blessed-components/password-field';
import { passwordField } from 'blessed-components/password-field/blessed';
```

`renderPasswordField` is display-only and masks `value` by default. The Blessed
adapter owns focus, editing, submit callbacks, and reveal toggling.

```ts
renderPasswordField({
  hint: 'Press Ctrl-R to reveal',
  label: 'Token',
  required: true,
  value: 'secret',
  width: 24,
});
```

The adapter returns an imperative handle with `value()`, `setValue()`,
`clear()`, `revealed()`, `setReveal()`, `toggleReveal()`, `submit()`,
`focus()`, `setData()`, and `destroy()`.
