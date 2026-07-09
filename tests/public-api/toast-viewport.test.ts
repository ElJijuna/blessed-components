import { describe, expect, it } from 'vitest';

import { renderToastViewport } from '@/index.js';

describe('ToastViewport', () => {
  it('renders newest bounded toasts with semantic markers', () => {
    expect(
      renderToastViewport({
        items: [
          { id: '1', message: 'Queued', tone: 'info' },
          { id: '2', message: 'Done', title: 'Deploy', tone: 'success' },
        ],
        limit: 1,
      }),
    ).toBe('+ Deploy: Done');
  });
});
