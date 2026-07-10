# GitStatus

Renders branch name and changed files grouped by state.

```ts
import { renderGitStatus } from 'blessed-components';

renderGitStatus({
  branch: 'main',
  files: [{ state: 'modified', path: 'src/app.ts' }],
});
```

## API

`renderGitStatus(options)` accepts `branch`, `files`, optional `width`, and `height`.

## Accessibility

State headings are plain text, so adapters can add colors without hiding meaning.
