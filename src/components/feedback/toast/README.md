# Toast

Toast renders a compact stack of transient feedback messages.

The pure helpers are deterministic and timer-free: callers provide timestamps,
durations, and explicit prune moments. The Blessed adapter exposes imperative
methods for adding, dismissing, clearing, and pruning visible toasts.

```ts
import { createToastStackState, renderToastStack } from 'blessed-components/toast';

const state = createToastStackState({ maxToasts: 3 });

state.add({
  createdAt: 1000,
  durationMs: 3000,
  id: 'deploy',
  title: 'Deploy started',
  tone: 'info',
});

renderToastStack({ toasts: state.list(), width: 32 });
```

```ts
import { toast } from 'blessed-components/toast/blessed';

const stack = toast({
  box: { bottom: 1, height: 8, right: 2, width: 36 },
  data: { maxToasts: 4 },
  parent: screen,
});

stack.add({
  id: 'saved',
  title: 'Settings saved',
  tone: 'success',
});
```
