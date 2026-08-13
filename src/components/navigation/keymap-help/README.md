# KeymapHelp

`KeymapHelp` renders registered commands grouped by scope. It marks duplicate
key chords within a scope as conflicts, preserves disabled commands and their
reasons, and supports query and scope filtering.

```ts
renderKeymapHelp({ commands: [{ id: 'save', description: 'Save file', keys: ['C-s'], scope: 'Editor' }] })
```
