import { describe, expect, it } from 'vitest';

import { renderDescriptionList } from '@/index.js';

describe('DescriptionList', () => {
  it('aligns terms and renders descriptions in columns', () => {
    expect(
      renderDescriptionList({
        items: [
          { term: 'Status', description: 'Online' },
          { term: 'CPU', description: '42%' },
          { term: 'Region', description: 'Lima' },
        ],
      }),
    ).toBe('Status  Online\nCPU     42%\nRegion  Lima');
  });

  it('aligns terms by terminal cells rather than string length', () => {
    expect(
      renderDescriptionList({
        items: [
          { term: '状态', description: 'Ready' },
          { term: 'CPU', description: '42%' },
        ],
      }),
    ).toBe('状态  Ready\nCPU   42%');
  });

  it('supports fixed term width, custom spacing, and row gaps', () => {
    expect(
      renderDescriptionList({
        gap: 1,
        items: [
          { term: 'Host', description: 'api-01' },
          { term: 'Port', description: 443 },
        ],
        rowGap: 1,
        termWidth: 6,
      }),
    ).toBe('Host   api-01\n\nPort   443');
  });

  it('truncates fixed-width terms by terminal cells', () => {
    expect(
      renderDescriptionList({
        items: [{ term: 'Environment', description: 'production' }],
        termWidth: 5,
      }),
    ).toBe('Envi…  production');
  });

  it('indents wrapped continuation lines under the description', () => {
    expect(
      renderDescriptionList({
        items: [{ term: 'Summary', description: 'Ready to deploy after checks pass.' }],
        layout: 'columns',
        width: 20,
      }),
    ).toBe('Summary  Ready to de\n         ploy after \n         checks pass\n         .');
  });

  it('uses stacked layout automatically when columns would leave little room', () => {
    expect(
      renderDescriptionList({
        items: [{ term: 'Summary', description: 'Ready to deploy after checks pass.' }],
        width: 14,
      }),
    ).toBe('Summary\n  Ready to deplo\n  y after checks\n   pass.');
  });

  it('supports explicit stacked layout', () => {
    expect(
      renderDescriptionList({
        gap: 4,
        items: [
          { term: 'Status', description: 'Online' },
          { term: 'Detail', description: 'All systems nominal' },
        ],
        layout: 'stacked',
      }),
    ).toBe('Status\n    Online\nDetail\n    All systems nominal');
  });

  it('returns empty text for an empty collection', () => {
    expect(renderDescriptionList({ items: [] })).toBe('');
  });

  it('removes ANSI sequences and Blessed tags from every text field', () => {
    expect(
      renderDescriptionList({
        items: [{ term: '{red-fg}CPU{/red-fg}', description: '\u001B[32m42%\u001B[0m' }],
      }),
    ).toBe('CPU  42%');
  });

  it('rejects invalid terms, numeric descriptions, widths, and spacing', () => {
    expect(() => renderDescriptionList({ items: [{ term: '', description: 'Online' }] })).toThrow(
      RangeError,
    );
    expect(() =>
      renderDescriptionList({ items: [{ term: 'CPU', description: Number.NaN }] }),
    ).toThrow(RangeError);
    expect(() => renderDescriptionList({ items: [], termWidth: -1 })).toThrow(RangeError);
    expect(() => renderDescriptionList({ gap: 1.5, items: [] })).toThrow(RangeError);
    expect(() => renderDescriptionList({ items: [], width: 0 })).toThrow(RangeError);
  });
});
