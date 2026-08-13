# CommandLog

`CommandLog` renders structured command history with status, timestamps, exit
codes, duration, retry attempts, and scheduled retry metadata. Its Blessed
adapter supports selection and delegates retries to the caller; it never
executes commands itself.

```ts
const log = commandLog({
  parent: screen,
  data: {
    items: [{ id: 'deploy-1', command: 'deploy production', status: 'failed', retryable: true }],
    onRetry(item) { retry(item.id) },
  },
})
```

Up/Down (or Shift+Tab/Tab) changes selection, Home/End jumps to an edge, and
Enter/Space requests a retry for a retryable selected entry.
