# ModeIndicator

`ModeIndicator` renders the current interaction mode such as normal, insert,
command, replace, or visual. Optional detail, modified state, and shortcut text
remain understandable without terminal color.

```ts
modeIndicator({ parent: screen, data: { mode: 'insert', detail: 'editing', shortcut: 'Esc' } })
```
