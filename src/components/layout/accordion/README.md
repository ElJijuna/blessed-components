# Accordion

Render multiple collapsible sections with keyboard navigation between headers.

## Features

- Pure helpers for section layout and deterministic toggling.
- Controlled and uncontrolled Blessed adapter.
- Single-section or multi-section expansion.
- Arrow, Home, and End navigation between enabled headers.
- Section bodies stay mounted while collapsed.

## Installation

```sh
npm install blessed blessed-components
```

## Pure utilities

```ts
import { calculateAccordionLayout, toggleAccordionSection } from 'blessed-components/accordion';

toggleAccordionSection({
  sections: [
    { id: 'build', title: 'Build', bodyHeight: 3 },
    { id: 'test', title: 'Test', bodyHeight: 4 },
  ],
  expandedIds: ['build'],
  sectionId: 'test',
});
// ['test']

calculateAccordionLayout({
  expandedIds: ['test'],
  gap: 1,
  sections: [
    { id: 'build', title: 'Build', bodyHeight: 3 },
    { id: 'test', title: 'Test', bodyHeight: 4 },
  ],
});
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { accordion } from 'blessed-components/accordion/blessed';

const screen = blessed.screen({ smartCSR: true });
const deploy = accordion({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 48,
    height: 12,
    border: 'line',
  },
  data: {
    defaultExpandedIds: ['build'],
    gap: 1,
    sections: [
      { id: 'build', title: 'Build', bodyHeight: 3, content: 'Queued\nRunning\nDone' },
      { id: 'test', title: 'Test', bodyHeight: 2, content: 'Unit\nIntegration' },
    ],
  },
});

screen.render();
deploy.focus();
```

Use `expandedIds` with `onExpandedIdsChange` for controlled state, or
`defaultExpandedIds` for uncontrolled state. The handle exposes `next()`,
`previous()`, `focusSection()`, `toggleFocused()`, `setSectionExpanded()`, and
`sections()`.
