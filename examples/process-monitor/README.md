# Process Monitor

Live block example showing system load, memory use, uptime, process metadata,
and a bounded CPU history.

```sh
npm run example:process-monitor
```

Values update once per second and screen rendering is batched after component
updates. The interval is cleared during cleanup. Press `q` to quit.

```sh
npm run example:process-monitor -- --smoke
```
