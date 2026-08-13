# SelectionSummary

`SelectionSummary` renders selected-item context and width-aware bulk actions on
one terminal-safe line. Actions are automatically disabled when nothing is
selected. The Blessed adapter delegates activation to the caller and never
changes collection state itself.

```ts
const summary = selectionSummary({
  parent: screen,
  data: {
    selectedCount: 3,
    totalCount: 12,
    noun: 'row',
    actions: [{ id: 'export', label: 'Export', shortcut: 'E' }],
    onAction(action) { runBulkAction(action.id) },
  },
})
```

Left/Right (or Shift+Tab/Tab) changes the active action. Home/End jumps to an
edge, and Enter/Space activates the focused action.
