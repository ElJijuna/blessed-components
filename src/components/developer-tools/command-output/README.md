# CommandOutput

Renders read-only command status and captured output. It does not execute processes.

```ts
import { renderCommandOutput } from 'blessed-components';

renderCommandOutput({
  command: 'npm test',
  status: 'running',
  output: ['starting'],
});
```

## API

`renderCommandOutput(options)` displays command label, status, optional exit code, and output lines.
