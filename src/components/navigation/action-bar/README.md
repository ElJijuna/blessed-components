# ActionBar

`ActionBar` renders a compact horizontal command surface. It supports labels,
shortcuts, disabled reasons, separators, keyboard focus, mouse activation, and
width-aware overflow.

```ts
const bar = actionBar({
  parent: screen,
  box: { width: 50, height: 1 },
  data: {
    actions: [
      { id: 'run', label: 'Run', shortcut: 'Enter', tone: 'primary' },
      { id: 'stop', label: 'Stop', shortcut: 'S', tone: 'danger' },
    ],
    onAction(action) {
      execute(action.id)
    },
  },
})
```

Keyboard map: Left/Shift+Tab selects the previous enabled action;
Right/Tab selects the next; Home/End select the first/last; Enter/Space
activates the selected action. Set `box.mouse` to `false` to opt out of mouse
activation. The caller owns `screen.render()` and must call `destroy()` during
cleanup.
