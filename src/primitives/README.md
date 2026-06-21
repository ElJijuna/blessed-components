# Primitives

Headless terminal behavior for composing accessible and predictable
`blessed-components`.

Primitives sit between algorithms and visual components:

```text
core algorithms
      ↓
headless primitives
      ↓
visual components
      ↓
Blessed adapters
```

They own state transitions and interaction policy. They do not render text,
choose colors, create Blessed elements, or call `screen.render()`.

## Imports

Import all primitives:

```ts
import {
  createCollection,
  createFocusScope,
  createOverlayStack,
  createScrollArea,
  createSelectionModel,
  createViewport,
} from 'blessed-components/primitives';
```

Prefer focused subpaths for the smallest module graph:

```ts
import { createSelectionModel } from 'blessed-components/primitives/selection';
```

## Collection

`createCollection` validates stable unique identifiers and provides ordered
lookup and enabled-item navigation.

```ts
const commands = createCollection([
  { id: 'build', label: 'Build' },
  { disabled: true, id: 'deploy', label: 'Deploy' },
  { id: 'test', label: 'Test' },
]);

commands.next('build')?.id; // "test"
```

Collection is the identity layer reused by selection and focus primitives.

## Selection

`createSelectionModel` provides single or multiple uncontrolled selection.
Disabled and unknown identifiers are ignored. Snapshots always follow
collection order, not interaction order.

```ts
const selection = createSelectionModel({
  items: [{ id: 'one' }, { id: 'two' }],
  mode: 'multiple',
  onChange: (ids) => {
    // Synchronize application or controlled component state.
  },
});

selection.toggle('two');
```

## Focus scope

`createFocusScope` models initial focus, forward/backward traversal, trapping,
and focus restoration.

```ts
const scope = createFocusScope({
  items: [{ id: 'cancel' }, { id: 'confirm' }],
});

const initialId = scope.activate('open-dialog');
const nextId = scope.next();
const restoreId = scope.deactivate();
```

The Blessed adapter maps these identifiers to real elements and calls
`focus()`. Keeping element access outside the primitive avoids hidden terminal
side effects.

## Viewport

`createViewport` manages a rectangular window over larger content. Scroll
offsets remain valid after resizing or content changes.

```ts
const viewport = createViewport({
  contentHeight: 200,
  contentWidth: 80,
  height: 20,
  width: 40,
});

viewport.ensureVisible({ height: 1, width: 10, x: 50, y: 100 });
```

## Scroll area

`createScrollArea` is a one-dimensional model for either a vertical or
horizontal axis. It supports lines, pages, home/end, resize clamping, and
scrollbar thumb metrics.

```ts
const vertical = createScrollArea({
  contentSize: 500,
  viewportSize: 20,
});

vertical.pageForward();
vertical.metrics();
```

Use one model per axis when both directions are scrollable.

## Overlay

`createOverlayStack` manages bottom-to-top layering. Modal entries block lower
layers. Escape targets only the top dismissible overlay. Closing returns the
focus identifier that the adapter should restore.

```ts
const overlays = createOverlayStack();

overlays.open({
  id: 'confirm-delete',
  modal: true,
  restoreFocusId: 'delete-button',
});

const result = overlays.handleEscape();
```

## Design guarantees

- No Blessed imports.
- No visual styling or theme decisions.
- Stable string identity instead of retained element instances.
- Disabled-item semantics shared across collection, selection, and focus.
- Defensive array snapshots.
- ESM, CommonJS, declarations, and focused tree-shakable subpaths.
