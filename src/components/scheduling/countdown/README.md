# Countdown

Renders remaining time until a target timestamp.

```ts
import { renderCountdown } from 'blessed-components';

renderCountdown({
  label: 'Deploy',
  endsAt: '2026-07-09T01:00:00.000Z',
  now: '2026-07-09T00:00:00.000Z',
});
```

## API

`renderCountdown(options)` returns `HH:mm:ss` while time remains and a completion label once elapsed.
