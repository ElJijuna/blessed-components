# QrCode

Renders a supplied boolean module matrix as terminal cells.

```ts
import { renderQrCode } from 'blessed-components';

renderQrCode({
  matrix: [
    [true, false],
    [false, true],
  ],
});
```

## API

`renderQrCode(options)` expects a rectangular non-empty matrix. QR encoding stays outside this renderer.
