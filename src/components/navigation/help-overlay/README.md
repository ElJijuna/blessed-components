# HelpOverlay

Searchable keyboard shortcut reference.

`HelpOverlay` accepts grouped `KeymapHelpItem` metadata, including the output of
`createKeymap().help()`, and renders a compact searchable reference.

```ts
import { createKeymap, helpOverlay, renderHelpOverlay } from 'blessed-components';

const keymap = createKeymap([
  { id: 'save', description: 'Save file', keys: ['C-s'], handler: save },
  { id: 'find', description: 'Find in page', keys: ['/'], handler: find },
]);

renderHelpOverlay({
  height: 8,
  sections: [{ title: 'Editor', items: keymap.help() }],
  width: 48,
});

helpOverlay({
  parent: screen,
  box: { height: 10, left: 4, top: 2, width: 52 },
  data: {
    defaultOpen: true,
    sections: [{ title: 'Editor', items: keymap.help() }],
  },
});
```

Keyboard support:

- Printable characters append to the search query.
- Backspace removes the final query character.
- Control-U clears the query.
- Escape closes the overlay unless `dismissOnEscape` is `false`.
