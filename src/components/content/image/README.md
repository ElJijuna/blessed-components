# Image

Renders terminal image fallback text.

```ts
import { renderImage } from 'blessed-components';

renderImage({ alt: 'Logo', source: 'logo.png' });
```

## API

`renderImage(options)` accepts required `alt`, optional `source`, `width`, and `height`.

## Accessibility

Alt text is required and is the primary output for terminals without image support.
