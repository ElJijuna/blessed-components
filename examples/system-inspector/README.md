# System Inspector

Live host-telemetry workspace for inspecting memory pressure, load averages,
and the processes consuming the most memory.

```sh
npm run example:system-inspector
```

It samples memory and load through `node:os`, reads a process snapshot from
`ps`, sorts by memory usage, and renders the result with `Grid`, `Stat`,
`MetricBars`, `Sparkline`, `Status`, and an interactive `Table`.

Use Up/Down or the mouse to focus processes, `r` to force a refresh, and `q` to
quit. Automatic snapshots run every two seconds.

```sh
npm run example:system-inspector -- --smoke
```
