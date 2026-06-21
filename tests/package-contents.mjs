import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const output = execFileSync(
  'npm',
  ['pack', '--dry-run', '--json', '--cache', join(tmpdir(), 'blessed-components-npm-cache')],
  { encoding: 'utf8' },
);
const [pack] = JSON.parse(output);
const paths = pack.files.map(({ path }) => path);
const forbiddenPaths = paths.filter(
  (path) =>
    path.startsWith('examples/') ||
    path.startsWith('tests/') ||
    path.startsWith('docs/') ||
    path.includes('/stories/') ||
    path.includes('.story.'),
);
const unexpectedSourceFiles = paths.filter(
  (path) =>
    path.startsWith('src/') &&
    path !== 'src/core/README.md' &&
    path !== 'src/primitives/README.md' &&
    !/^src\/components\/[^/]+\/[^/]+\/README\.md$/.test(path),
);

assert.deepEqual(
  forbiddenPaths,
  [],
  `Package contains preview or test files:\n${forbiddenPaths.join('\n')}`,
);
assert.deepEqual(
  unexpectedSourceFiles,
  [],
  `Package contains unpublished source files:\n${unexpectedSourceFiles.join('\n')}`,
);
assert(
  paths.some((path) => path.startsWith('dist/')),
  'Package must contain compiled components.',
);

console.log(`Package contents verified: ${paths.length} files, no stories or tests.`);
