# FileTree

Expandable file tree with file/directory and git-state markers.

```ts
renderFileTree({
  width: 40,
  height: 8,
  expandedIds: new Set(['src']),
  nodes: [{ id: 'src', kind: 'directory', label: 'src', children: [] }],
});
```
