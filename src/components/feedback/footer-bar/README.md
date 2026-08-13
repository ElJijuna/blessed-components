# FooterBar

`FooterBar` renders persistent application context, a current or transient
message, and responsive keyboard hints. Unlike `StatusBar`, which presents
sectioned status telemetry, FooterBar prioritizes app guidance and shortcuts.

```ts
const footer = footerBar({
  parent: screen,
  data: {
    context: '3 selected',
    message: 'Saved',
    tone: 'success',
    shortcuts: [{ key: 'Esc', label: 'clear' }, { key: '?', label: 'help' }],
  },
})
```
