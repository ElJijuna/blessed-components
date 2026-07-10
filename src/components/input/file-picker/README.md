# FilePicker

Renders filesystem entries from caller-provided data.

```ts
import { renderFilePicker } from 'blessed-components';

renderFilePicker({
  cwd: '/repo',
  selectedPath: 'src',
  entries: [{ type: 'directory', name: 'src', path: 'src' }],
});
```

## API

`renderFilePicker(options)` accepts `cwd`, `entries`, optional `selectedPath`, `width`, and `height`.

## Accessibility

Renderer never reads the filesystem; adapters own permission prompts, traversal, and selection announcements.
