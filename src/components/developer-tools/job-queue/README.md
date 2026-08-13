# JobQueue

`JobQueue` renders background jobs with lifecycle status, progress, retry metadata,
available actions, and a plain-text queue summary. Its Blessed adapter supports
selection and delegates cancellation and retries to the caller; it never runs jobs.

```ts
const queue = jobQueue({
  parent: screen,
  data: {
    items: [{ id: 'export', label: 'Export report', status: 'running', progress: 45, cancellable: true }],
    onCancel(job) { cancelJob(job.id) },
    onRetry(job) { retryJob(job.id) },
  },
})
```

Up/Down (or Shift+Tab/Tab) changes selection and Home/End jumps to an edge.
Delete or `c` requests cancellation; Enter, Space, or `r` requests a retry.
