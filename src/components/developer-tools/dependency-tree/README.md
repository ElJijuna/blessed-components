# DependencyTree

Renders package dependencies and problem labels as an indented tree.

```ts
import { renderDependencyTree } from 'blessed-components';

renderDependencyTree({
  roots: [{ name: 'app', children: [{ name: 'react', version: '19.0.0' }] }],
});
```

## API

`renderDependencyTree(options)` accepts `roots`, optional `width`, and `height`.

## Accessibility

Problems render as text (`! reason`) so warnings remain visible without color.
