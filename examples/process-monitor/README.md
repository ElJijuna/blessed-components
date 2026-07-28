# Node Runtime Monitor

Live runtime cockpit showing host load, memory pressure, Node heap/RSS, runtime
identity, uptime, and bounded CPU and memory histories.

```sh
npm run example:process-monitor
```

Values update once per second and screen rendering is batched after all
component updates. Histories retain only 30 samples and the interval is cleared
during cleanup. Press `q` to quit.

```sh
npm run example:process-monitor -- --smoke
```
