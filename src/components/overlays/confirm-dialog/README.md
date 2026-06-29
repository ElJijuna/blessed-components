# ConfirmDialog

Opinionated modal decision dialog built from Dialog and Button.

## Features

- Title, optional description, message, and two actions.
- Controlled `open` and uncontrolled `defaultOpen`.
- Escape maps to cancel.
- Cancel receives initial focus by default.
- Confirm, cancel, and generic result callbacks.
- Shared Dialog focus trapping and restoration.

## Installation

```sh
npm install blessed blessed-components
```

## Usage

```ts
import blessed from 'blessed';
import { confirmDialog } from 'blessed-components/confirm-dialog/blessed';

const screen = blessed.screen({ smartCSR: true });
const confirm = confirmDialog({
  parent: screen,
  data: {
    id: 'delete-confirm',
    title: 'Delete service',
    description: 'Production environment',
    message: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm() {
      // Delete the service.
    },
  },
});

confirm.open();
screen.render();
```

## State

Uncontrolled usage supplies `defaultOpen`. Controlled usage supplies `open` and
updates it from `onOpenChange`, matching Dialog semantics.

```ts
const confirm = confirmDialog({
  parent: screen,
  data: {
    id: 'publish-confirm',
    open,
    title: 'Publish release',
    message: 'Publish this release now?',
    onOpenChange(nextOpen) {
      open = nextOpen;
      confirm.setData({ id: 'publish-confirm', open, title: 'Publish release' });
    },
  },
});
```

In controlled mode, `open()`, `close()`, `cancel()`, and `confirm()` emit
requests. Visibility changes after `setData()` receives the new `open` value.

## Actions

Cancel is the initial focus by default. Use `initialFocusId: 'confirm'` only
when confirming is safe and reversible.

| Input | Behavior |
| --- | --- |
| Enter or Space on Confirm | Calls `onConfirm`, then `onResult('confirm')` |
| Enter or Space on Cancel | Calls `onCancel`, then `onResult('cancel')` |
| Escape | Cancels |

## Pure APIs

```ts
import { normalizeConfirmDialogAction } from 'blessed-components/confirm-dialog';
```

`normalizeConfirmDialogAction()` strips ANSI and Blessed tags, validates that
labels are one safe terminal line, and returns deterministic action metadata.

## Lifecycle

The handle exposes `isOpen`, `open()`, `close()`, `toggle()`, `cancel()`,
`confirm()`, `setData()`, and `destroy()`.

