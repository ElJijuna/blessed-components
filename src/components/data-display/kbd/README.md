# Kbd

`Kbd` renders keyboard shortcuts consistently. It accepts terminal-style chords
such as `C-s`, `M-enter`, and `S-tab`, then expands common modifiers to readable
labels.

```ts
import { renderKbd } from 'blessed-components/kbd';

renderKbd({ keys: 'C-s' });
// "[Ctrl]+[S]"
```

```ts
import blessed from 'blessed';
import { kbd } from 'blessed-components/kbd/blessed';

const screen = blessed.screen({ smartCSR: true });
const save = kbd({
  parent: screen,
  box: { top: 0, left: 0, width: 20, height: 1 },
  data: { keys: ['C-s', 'M-enter'] },
});

screen.render();
save.destroy();
screen.destroy();
```

Use `Kbd` for help overlays, hints, command lists, menus, and documentation.
