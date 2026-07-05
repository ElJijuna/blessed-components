# LoadingOverlay

LoadingOverlay renders centered loading content for blocking work.

The pure renderer is deterministic: callers pass the animation frame. The
Blessed adapter owns optional animation timing while the overlay is open and
uses the shared overlay stack as a modal layer.

```ts
import { renderLoadingOverlay } from 'blessed-components/loading-overlay';

renderLoadingOverlay({
  description: 'Fetching deployment status',
  frame: 2,
  label: 'Loading deployments',
  width: 32,
});
```

```ts
import { loadingOverlay } from 'blessed-components/loading-overlay/blessed';

const loading = loadingOverlay({
  data: {
    defaultOpen: true,
    description: 'Waiting for health checks',
    id: 'deploy-loading',
    label: 'Deploying',
  },
  parent: screen,
});
```
