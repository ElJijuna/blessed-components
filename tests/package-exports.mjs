import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pureModule = await import('../dist/progress-bar/index.js');
const blessedModule = await import('../dist/progress-bar/blessed.js');
const [pureEsmSource, pureCjsSource] = await Promise.all(
  ['../dist/progress-bar/index.js', '../dist/progress-bar/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);

assert.equal(typeof pureModule.renderProgressBar, 'function');
assert.equal(typeof blessedModule.progressBar, 'function');

for (const source of [pureEsmSource, pureCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure ProgressBar entry must not import Blessed.',
  );
}

console.log('Package subpath exports verified.');
