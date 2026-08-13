# DetailsPanel

`DetailsPanel` composes master and detail regions. Wide layouts show both side
by side; narrow layouts show the master until an item is selected, then switch
to the detail. The adapter exposes both regions for caller-owned widgets and
delegates selection/back state to the caller.

```ts
const panel = detailsPanel({
  parent: screen,
  data: { masterContent: 'API\nWorker', detailContent: 'API healthy', selectedId: 'api' },
})
panel.back()
```
