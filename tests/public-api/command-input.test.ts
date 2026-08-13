import { describe, expect, it } from 'vitest';
import {
  filterCommandInputSuggestions,
  renderCommandInput,
  renderCommandInputModel,
} from '@/index.js';

describe('CommandInput', () => {
  const suggestions = [
    { description: 'Deploy production', id: 'deploy', value: 'deploy production' },
    { disabled: true, id: 'rollback', value: 'rollback' },
  ] as const;

  it('renders prompt, cursor, status, and suggestions', () => {
    expect(
      renderCommandInput({
        activeSuggestionId: 'deploy',
        status: 'running',
        statusText: 'job 3',
        suggestions,
        value: 'dep',
      }),
    ).toBe('> dep│ [RUNNING: job 3]\n› deploy production - Deploy production');
  });
  it('filters suggestions', () => {
    expect(filterCommandInputSuggestions(suggestions, 'production').map(({ id }) => id)).toEqual([
      'deploy',
    ]);
  });
  it('clips and reports suggestion ids', () => {
    expect(renderCommandInputModel({ height: 2, suggestions, value: '' })).toEqual({
      content: '> Type a command\n  deploy production - Deploy production',
      visibleSuggestionIds: ['deploy'],
    });
  });
  it('validates dimensions, prompt, and cursor', () => {
    expect(() => renderCommandInput({ prompt: '', value: '' })).toThrow(RangeError);
    expect(() => renderCommandInput({ cursor: 3, value: 'a' })).toThrow(RangeError);
    expect(() => renderCommandInput({ value: '', width: -1 })).toThrow(RangeError);
  });
});
