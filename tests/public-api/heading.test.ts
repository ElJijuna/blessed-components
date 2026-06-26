import { describe, expect, it } from 'vitest';

import { renderHeading } from '@/index.js';

describe('Heading', () => {
  it('renders safe hierarchy markers and truncates by default', () => {
    expect(
      renderHeading({
        content: '\u001B[31m{bold}Deployments{/bold}\u001B[0m',
        level: 2,
        width: 12,
      }),
    ).toBe('## Deployme…');
  });

  it('can render without a marker and with an underline', () => {
    expect(
      renderHeading({
        content: 'Release',
        marker: false,
        underline: true,
      }),
    ).toBe('Release\n-------');
  });

  it('supports wrapping through Text layout options', () => {
    expect(
      renderHeading({
        content: 'Build queue',
        level: 3,
        overflow: 'wrap',
        width: 14,
      }),
    ).toBe('### Build queu\ne');
  });

  it('rejects invalid heading levels', () => {
    expect(() =>
      renderHeading({
        content: 'Nope',
        level: 7 as never,
      }),
    ).toThrow(RangeError);
  });
});
