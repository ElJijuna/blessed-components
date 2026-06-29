import { describe, expect, it } from 'vitest';

import { CALLOUT_ASCII_BORDER, renderCallout } from '@/index.js';

describe('Callout', () => {
  it('renders framed semantic title and content', () => {
    expect(
      renderCallout({
        content: 'Retry after health checks recover.',
        title: 'Deploy delayed',
        tone: 'warning',
        width: 24,
      }),
    ).toBe(
      [
        '╭──────────────────────╮',
        '│ ! Deploy delayed     │',
        '│ Retry after health   │',
        '│ checks recover.      │',
        '╰──────────────────────╯',
      ].join('\n'),
    );
  });

  it('supports ASCII borders and markerless output', () => {
    expect(
      renderCallout({
        border: CALLOUT_ASCII_BORDER,
        content: 'All checks passed',
        showMarker: false,
      }),
    ).toBe(['+-------------------+', '| All checks passed |', '+-------------------+'].join('\n'));
  });

  it('sanitizes terminal markup and wraps long words', () => {
    expect(
      renderCallout({
        content: '\u001B[31m{bold}Supercalifragilistic{/bold}\u001B[0m',
        marker: '!',
        width: 12,
      }),
    ).toBe(
      [
        '╭──────────╮',
        '│ !        │',
        '│ Supercal │',
        '│ ifragili │',
        '│ stic     │',
        '╰──────────╯',
      ].join('\n'),
    );
  });

  it('rejects empty content, invalid dimensions, and wide markers or borders', () => {
    expect(() => renderCallout({ content: '   ' })).toThrow(RangeError);
    expect(() => renderCallout({ content: 'Ready', padding: -1 })).toThrow(RangeError);
    expect(() => renderCallout({ content: 'Ready', width: 3 })).toThrow(RangeError);
    expect(() => renderCallout({ content: 'Ready', marker: 'OK' })).toThrow(RangeError);
    expect(() =>
      renderCallout({
        border: { ...CALLOUT_ASCII_BORDER, horizontal: '--' },
        content: 'Ready',
      }),
    ).toThrow(RangeError);
  });
});
