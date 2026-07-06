# NumberField

Single-line numeric input with parsing, inclusive bounds, and step controls.

```ts
import { renderNumberField } from 'blessed-components/number-field';
import { numberField } from 'blessed-components/number-field/blessed';
```

`renderNumberField` is display-only. The Blessed adapter owns focus, parsing,
submit callbacks, and Up/Down step behavior.

```ts
renderNumberField({
  hint: 'Use Up/Down to adjust',
  label: 'Replicas',
  max: 10,
  min: 0,
  step: 1,
  value: 3,
  width: 24,
});
```

The adapter returns an imperative handle with `value()`, `setValue()`,
`setInput()`, `increment()`, `decrement()`, `clear()`, `submit()`, `focus()`,
`setData()`, and `destroy()`.
