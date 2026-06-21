import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pureModule = await import('../dist/progress-bar/index.js');
const blessedModule = await import('../dist/progress-bar/blessed.js');
const pureSparklineModule = await import('../dist/sparkline/index.js');
const blessedSparklineModule = await import('../dist/sparkline/blessed.js');
const [pureEsmSource, pureCjsSource] = await Promise.all(
  ['../dist/progress-bar/index.js', '../dist/progress-bar/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [sparklineEsmSource, sparklineCjsSource] = await Promise.all(
  ['../dist/sparkline/index.js', '../dist/sparkline/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);

assert.equal(typeof pureModule.renderProgressBar, 'function');
assert.equal(typeof blessedModule.progressBar, 'function');
assert.equal(typeof pureSparklineModule.renderSparkline, 'function');
assert.equal(typeof blessedSparklineModule.sparkline, 'function');

for (const source of [pureEsmSource, pureCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure ProgressBar entry must not import Blessed.',
  );
}

for (const source of [sparklineEsmSource, sparklineCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Sparkline entry must not import Blessed.');
}

console.log('Package subpath exports verified.');
