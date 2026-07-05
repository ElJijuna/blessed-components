import { describe, expect, it } from 'vitest';

import { calculatePageLayout, renderPageHeader } from '@/index.js';

describe('Page', () => {
  it('calculates header, body, and footer regions', () => {
    expect(
      calculatePageLayout({
        footerHeight: 1,
        gap: 1,
        headerHeight: 2,
        height: 10,
        width: 40,
      }),
    ).toEqual({
      body: { height: 5, width: 40, x: 0, y: 3 },
      footer: { height: 1, width: 40, x: 0, y: 9 },
      header: { height: 2, width: 40, x: 0, y: 0 },
    });
  });

  it('renders title, subtitle, and right-aligned actions', () => {
    expect(
      renderPageHeader({
        actions: 'q quit',
        subtitle: 'prod',
        title: 'Deployments',
        width: 28,
      }),
    ).toBe('Deployments - prod    q quit');
  });

  it('truncates labels and actions by terminal cell width', () => {
    expect(renderPageHeader({ actions: 'very long action', title: 'Deployments', width: 10 })).toBe(
      'very long…',
    );
    expect(renderPageHeader({ actions: 'q', title: 'Deployments', width: 8 })).toBe('Deplo… q');
  });

  it('removes ANSI sequences and Blessed tags from header fields', () => {
    expect(
      renderPageHeader({
        actions: '{bold}q{/bold}',
        title: '\u001B[32mDeployments\u001B[0m',
        width: 16,
      }),
    ).toBe('Deployments    q');
  });

  it('rejects invalid dimensions and multiline text', () => {
    expect(() => calculatePageLayout({ height: -1, width: 10 })).toThrow(RangeError);
    expect(() => renderPageHeader({ title: '', width: 10 })).toThrow(RangeError);
    expect(() =>
      renderPageHeader({ title: 'Deployments', subtitle: 'bad\nline', width: 10 }),
    ).toThrow(RangeError);
  });
});
