# InspectorPanel

`InspectorPanel` combines a heading, inline metadata, tabs, caller-rendered tab
content, and contextual actions. Tab content can be produced by `JsonViewer`,
`LogViewer`, `Inspector`, or any other renderer. The Blessed adapter supports
tab navigation and delegates actions without owning application state.

```ts
const panel = inspectorPanel({
  parent: screen,
  data: { title: 'API', tabs: [{ id: 'json', label: 'JSON', content: '{ "ok": true }' }] },
})
```
