import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const cliPath = fileURLToPath(
  new URL('../../bin/create-blessed-components-app.mjs', import.meta.url),
);

describe('create-blessed-components-app CLI', () => {
  it('prints the starter file plan in dry-run mode', () => {
    const output = execFileSync('node', [cliPath, 'demo-app', '--dry-run'], {
      encoding: 'utf8',
    });

    expect(output).toContain('Would create demo-app');
    expect(output).toContain('package.json');
    expect(output).toContain('src/app.ts');
  });

  it('scaffolds a typed terminal app starter', () => {
    const parent = mkdtempSync(join(tmpdir(), 'blessed-components-cli-'));
    const target = join(parent, 'demo-app');

    execFileSync('node', [cliPath, target], {
      encoding: 'utf8',
    });

    expect(readFileSync(join(target, 'package.json'), 'utf8')).toContain('"name": "demo-app"');
    expect(readFileSync(join(target, 'src/app.ts'), 'utf8')).toContain('cardRoot');
    expect(readFileSync(join(target, 'README.md'), 'utf8')).toContain('demo-app');
  });
});
