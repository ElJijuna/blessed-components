import { describe, expect, it } from 'vitest';

import { renderFilePicker } from '@/index.js';

describe('FilePicker', () => {
  it('renders directories and files from caller data', () => {
    expect(
      renderFilePicker({
        cwd: '/repo',
        entries: [
          { name: 'src', path: 'src', type: 'directory' },
          { name: 'README.md', path: 'README.md', type: 'file' },
        ],
        selectedPath: 'src',
      }),
    ).toBe(['cwd: /repo', '> [D] src', '  [F] README.md'].join('\n'));
  });
});
