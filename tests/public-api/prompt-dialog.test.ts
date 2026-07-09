import { describe, expect, it } from 'vitest';

import { renderPromptDialog } from '@/index.js';

describe('PromptDialog', () => {
  it('renders prompt value, error, and actions as safe text', () => {
    expect(
      renderPromptDialog({
        defaultValue: '{bold}main{/bold}',
        error: 'Required',
        message: 'Branch name',
        title: 'Rename',
        width: 24,
      }),
    ).toBe(['Rename', 'Branch name', '> main', '! Required', '[OK] [Cancel]'].join('\n'));
  });
});
