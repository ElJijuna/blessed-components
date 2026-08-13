# HeaderBar

`HeaderBar` renders application identity, active workspace/environment, primary
status, and responsive contextual actions. Its Blessed adapter supports action
navigation and delegates activation to the caller.

```ts
headerBar({ parent: screen, data: { title: 'Console', workspace: 'payments', environment: 'prod', status: { marker: '●', label: 'online' } } })
```
