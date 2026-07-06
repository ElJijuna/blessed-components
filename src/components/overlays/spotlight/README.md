# Spotlight

Full-screen searchable action and resource overlay.

```ts
import {
  createSpotlightState,
  filterSpotlightItems,
} from 'blessed-components/spotlight';
import { spotlight } from 'blessed-components/spotlight/blessed';
```

`filterSpotlightItems` searches item id, label, shortcut, and keywords. The
Blessed adapter composes a modal layer, search field, result menu, and status
line with focus trapping and Escape dismissal.

```ts
const commands = [
  { id: 'deploy', label: 'Deploy service', shortcut: 'd', keywords: ['release'] },
  { id: 'logs', label: 'Open logs', shortcut: 'l' },
];

const commandPalette = spotlight({
  data: {
    defaultOpen: true,
    id: 'commands',
    items: commands,
    onAction(command) {
      runCommand(command.id);
    },
  },
  parent: screen,
});
```

Actions close Spotlight by default. Set `closeOnAction: false` to keep it open
after activation.
