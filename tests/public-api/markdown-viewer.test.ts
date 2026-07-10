import { describe, expect, it } from 'vitest';

import { renderMarkdownViewer } from '@/index.js';

describe('MarkdownViewer', () => {
  it('renders markdown as plain terminal text', () => {
    expect(renderMarkdownViewer({ markdown: '# Title\n**bold** and `code`' })).toBe(
      ['Title', 'bold and code'].join('\n'),
    );
  });
});
