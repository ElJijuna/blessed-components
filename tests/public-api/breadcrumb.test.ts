import { describe, expect, it } from 'vitest';

import { renderBreadcrumb } from '@/index.js';

describe('Breadcrumb', () => {
  it('renders ordered path segments with the default separator', () => {
    expect(
      renderBreadcrumb({
        items: [{ label: 'Home' }, { label: 'Projects' }, { label: 'blessed-components' }],
      }),
    ).toBe('Home / Projects / blessed-components');
  });

  it('supports a custom separator', () => {
    expect(
      renderBreadcrumb({
        items: [{ label: 'Home' }, { label: 'Projects' }, { label: 'CLI' }],
        separator: ' > ',
      }),
    ).toBe('Home > Projects > CLI');
  });

  it('collapses middle segments before truncating long paths', () => {
    expect(
      renderBreadcrumb({
        items: [
          { label: 'Home' },
          { label: 'Projects' },
          { label: 'blessed-components' },
          { label: 'Roadmap' },
        ],
        width: 16,
      }),
    ).toBe('Home / … / Road…');
  });

  it('can disable middle collapse and rely on Text overflow behavior', () => {
    expect(
      renderBreadcrumb({
        collapse: false,
        items: [
          { label: 'Home' },
          { label: 'Projects' },
          { label: 'blessed-components' },
          { label: 'Roadmap' },
        ],
        width: 18,
      }),
    ).toBe('Home / Projects /…');
  });

  it('sanitizes terminal markup and aligns through Text options', () => {
    expect(
      renderBreadcrumb({
        align: 'right',
        items: [{ label: '\u001B[31m{bold}Home{/bold}\u001B[0m' }, { label: 'API' }],
        width: 14,
      }),
    ).toBe('    Home / API');
  });

  it('returns empty text for an empty path', () => {
    expect(renderBreadcrumb({ items: [] })).toBe('');
  });

  it('rejects invalid labels, separators, omissions, and dimensions', () => {
    expect(() => renderBreadcrumb({ items: [{ label: '' }] })).toThrow(RangeError);
    expect(() => renderBreadcrumb({ items: [{ label: 'A\nB' }] })).toThrow(RangeError);
    expect(() =>
      renderBreadcrumb({
        items: [{ label: 'Home' }, { label: 'Projects' }],
        separator: '',
      }),
    ).toThrow(RangeError);
    expect(() => renderBreadcrumb({ items: [], omission: '' })).toThrow(RangeError);
    expect(() => renderBreadcrumb({ items: [], width: -1 })).toThrow(RangeError);
  });
});
