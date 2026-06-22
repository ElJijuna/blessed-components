import { describe, expect, it } from 'vitest';

import { renderKeyValue } from '@/index.js';

describe('KeyValue', () => {
  it('aligns keys and renders values in rows', () => {
    expect(
      renderKeyValue({
        items: [
          { key: 'Status', value: 'Online' },
          { key: 'CPU', value: '42%' },
          { key: 'Region', value: 'Lima' },
        ],
      }),
    ).toBe('Status : Online\nCPU    : 42%\nRegion : Lima');
  });

  it('aligns keys by terminal cells rather than string length', () => {
    expect(
      renderKeyValue({
        items: [
          { key: '状态', value: 'Ready' },
          { key: 'CPU', value: '42%' },
        ],
      }),
    ).toBe('状态 : Ready\nCPU  : 42%');
  });

  it('supports fixed key width, custom separators, and spacing', () => {
    expect(
      renderKeyValue({
        gap: 2,
        items: [
          { key: 'Host', value: 'api-01' },
          { key: 'Port', value: 443 },
        ],
        keyWidth: 6,
        separator: '│',
      }),
    ).toBe('Host    │  api-01\nPort    │  443');
  });

  it('truncates fixed-width keys by terminal cells', () => {
    expect(
      renderKeyValue({
        items: [{ key: 'Environment', value: 'production' }],
        keyWidth: 5,
      }),
    ).toBe('Envi… : production');
  });

  it('indents continuation lines under the value', () => {
    expect(
      renderKeyValue({
        items: [{ key: 'Address', value: 'Line one\nLine two' }],
      }),
    ).toBe('Address : Line one\n          Line two');
  });

  it('supports compact inline layout', () => {
    expect(
      renderKeyValue({
        itemSeparator: ' | ',
        items: [
          { key: 'CPU', value: '42%' },
          { key: 'RAM', value: '8 GB' },
        ],
        layout: 'inline',
      }),
    ).toBe('CPU : 42% | RAM : 8 GB');
  });

  it('returns empty text for an empty collection', () => {
    expect(renderKeyValue({ items: [] })).toBe('');
  });

  it('removes ANSI sequences and Blessed tags from every text field', () => {
    expect(
      renderKeyValue({
        itemSeparator: '\u001B[31m | \u001B[0m',
        items: [{ key: '{red-fg}CPU{/red-fg}', value: '\u001B[32m42%\u001B[0m' }],
        separator: '{bold}:{/bold}',
      }),
    ).toBe('CPU : 42%');
  });

  it('rejects invalid keys, numeric values, widths, and gaps', () => {
    expect(() => renderKeyValue({ items: [{ key: '', value: 'Online' }] })).toThrow(RangeError);
    expect(() => renderKeyValue({ items: [{ key: 'CPU', value: Number.NaN }] })).toThrow(
      RangeError,
    );
    expect(() => renderKeyValue({ items: [], keyWidth: -1 })).toThrow(RangeError);
    expect(() => renderKeyValue({ gap: 1.5, items: [] })).toThrow(RangeError);
  });
});
