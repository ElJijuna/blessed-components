# System Inspector

Live example for inspecting memory pressure and top processes using public
`blessed-components` adapters.

```sh
npm run example:system-inspector
```

It samples memory and load through `node:os`, reads a process snapshot from
`ps`, sorts by memory usage, and renders the result with `Grid`, `Stat`,
`MetricBars`, `Sparkline`, `Table`, and `KeyValue`.

Press `q` to quit.

```sh
npm run example:system-inspector -- --smoke
```
