# CommandInput

`CommandInput` provides prompt-style command entry with suggestions, history,
execution status, submission, cancellation, and controlled/uncontrolled value.
It delegates command execution to the caller.

```ts
commandInput({ parent: screen, data: { suggestions: [{ id: 'deploy', value: 'deploy production' }], onSubmit(value) { run(value) } } })
```
