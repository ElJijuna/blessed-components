# Dialog

Composable modal terminal overlay with controlled/uncontrolled state, focus
capture, Tab trapping, Escape dismissal, and focus restoration.

## Features

- Compound parts: Root, Content, Title, Description, Body, Footer.
- Controlled `open` and uncontrolled `defaultOpen`.
- Shared overlay ordering for nested dialogs.
- Initial focus and trapped Tab/Shift+Tab navigation.
- Escape dismissal for topmost Dialog only.
- Previous focus restoration.
- Shared Box theming.
- Listener cleanup on destroy.

## Installation

```sh
npm install blessed blessed-components
```

## Composition

```ts
import blessed from 'blessed';
import {
  dialogBody,
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogRoot,
  dialogTitle,
} from 'blessed-components/dialog/blessed';

const screen = blessed.screen({ smartCSR: true });
const trigger = blessed.button({
  parent: screen,
  content: 'Open deploy dialog',
  width: 24,
  height: 1,
});
const dialog = dialogRoot({
  parent: screen,
  data: {
    id: 'deploy-dialog',
    defaultOpen: false,
    initialFocusId: 'cancel',
  },
});
const content = dialogContent({ parent: dialog.element });

dialogTitle({ parent: content.element, data: { content: 'Deploy service' } });
dialogDescription({
  parent: content.element,
  data: { content: 'Production environment' },
});
dialogBody({
  parent: content.element,
  data: { content: 'Continue with deployment?' },
});
dialogFooter({
  parent: content.element,
  data: { content: 'Enter confirm · Esc cancel' },
});

const cancel = blessed.button({
  parent: content.element,
  content: 'Cancel',
  bottom: 0,
  left: 0,
  width: 10,
  height: 1,
});
const confirm = blessed.button({
  parent: content.element,
  content: 'Confirm',
  bottom: 0,
  right: 0,
  width: 10,
  height: 1,
});

dialog.registerFocusable('cancel', cancel);
dialog.registerFocusable('confirm', confirm);

trigger.on('press', () => {
  dialog.open();
  screen.render();
});
```

## State

Uncontrolled usage uses `defaultOpen`. Controlled usage supplies `open` and
updates it after `onOpenChange`:

```ts
const dialog = dialogRoot({
  parent: screen,
  data: {
    id: 'settings-dialog',
    open,
    onOpenChange(nextOpen) {
      open = nextOpen;
      dialog.setData({ id: 'settings-dialog', open });
    },
  },
});
```

In controlled mode, `open()`, `close()`, and `toggle()` emit requests. Visible
state changes only after `setData()` receives the new `open` value.

## Focus management

- Registration order defines Tab order.
- `initialFocusId` selects preferred initial focus.
- Removed or disabled controls should be unregistered.
- Tab and Shift+Tab wrap inside active Dialog.
- Closing restores the Blessed element focused before opening.

## Escape and nested dialogs

`dismissOnEscape` defaults to `true`. Only topmost open Dialog responds. Set it
to `false` when explicit action is required.

Dialogs share one overlay stack per Blessed screen. Nested Dialogs block
keyboard handling in lower layers until top layer closes.

## Visual parts

Default Content is centered, bordered, 70% wide, and 60% tall.

| Part | Default layout |
| --- | --- |
| Title | Top row, bold |
| Description | Second row, muted |
| Body | Remaining space above footer |
| Footer | Bottom row, muted |

Every default can be overridden through `box`.

## Pure APIs

```ts
import { createDialogState, renderDialogRegion } from 'blessed-components/dialog';
```

`createDialogState()` provides deterministic controlled/uncontrolled behavior.
`renderDialogRegion()` provides safe cell-aware text without Blessed.

## Theming

All parts use Box theme fields. Root uses `foregroundTone`; visual regions use
`tone`. `backgroundTone`, `borderTone`, `theme`, and `capabilities` are also
available. Explicit Blessed styles win.

## Accessibility and keyboard map

| Key | Behavior |
| --- | --- |
| Tab | Focus next registered control, wrapping |
| Shift+Tab | Focus previous registered control, wrapping |
| Escape | Request close when enabled and topmost |

Title and description remain visible terminal text. Meaning must not depend
only on color.

## Lifecycle

Root handle exposes `isOpen`, `open()`, `close()`, `toggle()`,
`registerFocusable()`, `unregisterFocusable()`, `setData()`, and `destroy()`.

`destroy()` removes global key listener, overlay entry, and nested children. It
restores focus when needed.

## Tree shaking

```ts
import { createDialogState } from 'blessed-components/dialog';
import { dialogRoot } from 'blessed-components/dialog/blessed';
```
