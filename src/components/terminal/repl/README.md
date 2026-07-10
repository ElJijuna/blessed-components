# REPL

Renders prompt, history, and current input without evaluating code.

```ts
import { renderRepl } from 'blessed-components';

renderRepl({ history: [{ input: '1 + 1', output: '2' }], currentInput: 'Math.' });
```

## API

`renderRepl(options)` accepts optional `history`, `currentInput`, `prompt`, `width`, and `height`.

## Accessibility

Prompt and outputs render as plain text. Adapters own evaluation, history search, and cancellation.
