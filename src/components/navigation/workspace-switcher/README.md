# WorkspaceSwitcher

`WorkspaceSwitcher` renders searchable projects, clusters, databases, or
sessions with environment and status metadata. Its Blessed adapter supports
keyboard navigation and controlled or uncontrolled selection.

```ts
workspaceSwitcher({ parent: screen, data: { items: [{ id: 'payments', label: 'Payments', environment: 'prod' }] } })
```
