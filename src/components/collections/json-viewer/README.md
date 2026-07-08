# JsonViewer

Expandable JSON value renderer using deterministic path ids such as `$`, `$.name`, and `$[0]`.

```ts
renderJsonViewer({
  width: 50,
  height: 10,
  value: { user: { name: 'Ada' } },
  expandedPaths: new Set(['$', '$.user']),
});
```
