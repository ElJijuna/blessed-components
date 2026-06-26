# Label

`Label` renders stable one-line labels for controls and values. It strips ANSI
sequences and Blessed tags, supports a required marker, and keeps suffix,
truncation, and alignment deterministic.

```ts
import { renderLabel } from 'blessed-components/label';

renderLabel({
  content: 'Project',
  required: true,
});
// "Project *:"
```

```ts
import blessed from 'blessed';
import { label } from 'blessed-components/label/blessed';

const screen = blessed.screen({ smartCSR: true });
const project = label({
  parent: screen,
  box: { top: 0, left: 0, width: 16, height: 1 },
  data: {
    content: 'Project',
    required: true,
  },
});

screen.render();
project.destroy();
screen.destroy();
```

The Blessed adapter uses the `muted` foreground tone by default, while pure
rendering stays plain text and framework-independent.
