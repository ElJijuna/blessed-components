# HexViewer

Renders byte offsets, hex bytes, and ASCII preview.

```ts
import { renderHexViewer } from 'blessed-components';

renderHexViewer({ bytes: [72, 105] });
```

## API

`renderHexViewer(options)` accepts `bytes`, optional `columns`, `offset`, `width`, and `height`.

## Accessibility

Hex and ASCII are both rendered as text; non-printable bytes become `.`.
